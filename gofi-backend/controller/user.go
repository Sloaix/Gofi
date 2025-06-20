package controller

import (
	"gofi/db"
	"gofi/env"
	"gofi/i18n"
	tool "gofi/tool"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUser(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)
	userId, err := tool.ParseUserIdFromJWT(ctx)
	if err != nil {
		tool.WithError(err).Error(i18n.T(ctx.Request.Context(), "user.info_failed_token_parse"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "user.not_exist")).Build())
		return
	}

	user, err := db.QueryUserById(userId)
	if err != nil {
		tool.WithError(err).WithField("user_id", userId).Error(i18n.T(ctx.Request.Context(), "user.info_failed_not_exist"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "user.not_exist")).Build())
		return
	}

	tool.WithField("user_id", user.Id).Debug(i18n.T(ctx.Request.Context(), "user.info_success"))
	ctx.JSON(http.StatusOK, NewResource().Payload(user).Build())
}

func ChangePassword(ctx *gin.Context) {
	if env.IsPreview() {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.T(ctx.Request.Context(), "error.operation_not_allowed_preview")).Build())
		return
	}

	var passwordChangeParam = new(db.PasswordChangeParam)

	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.BindJSON(passwordChangeParam); ctx.Request.ContentLength != 0 && err != nil {
		tool.WithError(err).Error(i18n.T(ctx.Request.Context(), "user.change_password_failed_param"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Build())
		return
	}

	// 验证密码和确认密码是否一致
	if passwordChangeParam.Password != passwordChangeParam.Confirm {
		tool.Warn(i18n.T(ctx.Request.Context(), "user.password_confirm_not_match"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "user.password_confirm_not_match")).Build())
		return
	}

	userId, err := tool.ParseUserIdFromJWT(ctx)
	if err != nil {
		tool.WithError(err).Error(i18n.T(ctx.Request.Context(), "user.change_password_failed_token_parse"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "user.not_exist")).Build())
		return
	}

	tool.WithField("user_id", userId).Debug(i18n.T(ctx.Request.Context(), "user.change_password_start"))
	err = db.ChangeUserPassword(userId, tool.MD5(passwordChangeParam.Confirm))

	if err != nil {
		tool.WithError(err).WithField("user_id", userId).Error(i18n.T(ctx.Request.Context(), "user.change_password_failed_db"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "user.not_exist")).Build())
		return
	}

	tool.WithField("user_id", userId).Info(i18n.T(ctx.Request.Context(), "user.change_password_success"))
	ctx.JSON(http.StatusOK, NewResource().Success().Build())
}

// Login 登录成功会生成一个jwt返回给请求者
func Login(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)
	var loginBody = new(db.LoginParam)

	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.BindJSON(loginBody); ctx.Request.ContentLength != 0 && err != nil {
		tool.WithError(err).Error(i18n.T(ctx.Request.Context(), "user.login_failed_param"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Build())
		return
	}

	// 验证用户名和密码
	user, err := db.QueryUserByUsername(loginBody.Username)
	if err != nil || tool.MD5(loginBody.Password) != user.Password {
		tool.WithFields(map[string]interface{}{
			"username": loginBody.Username,
			"error":    err,
		}).Warn(i18n.T(ctx.Request.Context(), "user.login_failed_username_or_password"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "user.invalid_credentials")).Build())
		return
	}

	tool.WithFields(map[string]interface{}{
		"user_id":  user.Id,
		"username": user.Username,
		"role":     user.RoleType,
	}).Info(i18n.T(ctx.Request.Context(), "user.login_success"))

	// 生成JWT
	tokenString, err := tool.GenerateJWT(user.Id, user.Username, int(user.RoleType))
	if err != nil {
		tool.WithError(err).WithField("user_id", user.Id).Error(i18n.T(ctx.Request.Context(), "user.jwt_generate_failed"))
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "error.internal")).Build())
		return
	}

	ctx.JSON(http.StatusOK, NewResource().Payload(tokenString).Build())
}

// Logout 让jwt过期
func Logout(ctx *gin.Context) {
	userId, err := tool.ParseUserIdFromJWT(ctx)
	if err == nil {
		tool.WithField("user_id", userId).Info(i18n.T(ctx.Request.Context(), "user.logout_success"))
	}
	ctx.JSON(http.StatusOK, NewResource().Message(i18n.T(ctx.Request.Context(), "success.logout")).Build())
}
