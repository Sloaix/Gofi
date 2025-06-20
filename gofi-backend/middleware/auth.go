package middleware

import (
	"gofi/controller"
	"gofi/db"
	"gofi/i18n"
	"gofi/tool"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthChecker 认证检查中间件
func AuthChecker(ctx *gin.Context) {
	logger := tool.WithFields(map[string]interface{}{
		"path":   ctx.Request.URL.Path,
		"method": ctx.Request.Method,
	})

	logger.Debug(i18n.T(ctx, "auth.check_start"))

	// 解析JWT
	claims, err := tool.ParseJWTFromHeader(ctx)
	if err != nil {
		logger.WithError(err).Error("Token解析失败")
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Code(controller.StatusTokenInvalid).Message(i18n.T(ctx, "auth.not_authorized")).Build())
		return
	}

	// 验证用户是否存在
	user, err := db.QueryUserById(claims.UserId)
	if err != nil {
		logger.WithError(err).WithField("user_id", claims.UserId).Error(i18n.T(ctx, "user.not_exist"))
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Code(controller.StatusTokenInvalid).Message(i18n.T(ctx, "user.not_exist")).Build())
		return
	}

	// 验证用户名是否匹配（防止用户被删除后Token仍有效）
	if user.Username != claims.Username {
		logger.WithFields(map[string]interface{}{
			"token_username": claims.Username,
			"db_username":    user.Username,
			"user_id":        claims.UserId,
		}).Error(i18n.T(ctx, "auth.username_not_match"))
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Code(controller.StatusTokenInvalid).Message(i18n.T(ctx, "auth.not_authorized")).Build())
		return
	}

	// 验证角色是否匹配
	if int(user.RoleType) != claims.RoleType {
		logger.WithFields(map[string]interface{}{
			"token_role": claims.RoleType,
			"db_role":    user.RoleType,
			"user_id":    claims.UserId,
		}).Error(i18n.T(ctx, "auth.role_not_match"))
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Code(controller.StatusTokenInvalid).Message(i18n.T(ctx, "auth.not_authorized")).Build())
		return
	}

	// 将用户信息存储到上下文中，供后续处理器使用
	ctx.Set("currentUser", user)
	ctx.Set("currentUserId", claims.UserId)
	ctx.Set("currentUserRole", claims.RoleType)

	logger.WithFields(map[string]interface{}{
		"user_id":  claims.UserId,
		"username": claims.Username,
		"role":     claims.RoleType,
	}).Debug(i18n.T(ctx, "auth.check_success"))
}

// AdminChecker 管理员权限检查中间件
func AdminChecker(ctx *gin.Context) {
	logger := tool.WithField("path", ctx.Request.URL.Path)
	logger.Debug(i18n.T(ctx, "auth.admin_check_start"))

	// 先进行基础认证
	AuthChecker(ctx)
	if ctx.IsAborted() {
		return
	}

	// 检查是否为管理员角色
	roleType, exists := ctx.Get("currentUserRole")
	if !exists {
		logger.Error(i18n.T(ctx, "auth.get_role_failed"))
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Fail().Message(i18n.T(ctx, "auth.not_authorized")).Build())
		return
	}

	if roleType.(int) != int(db.RoleTypeAdmin) {
		logger.WithField("current_role", roleType).Error(i18n.T(ctx, "auth.admin_permission_denied"))
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Fail().Message(i18n.T(ctx, "auth.insufficient_permissions")).Build())
		return
	}

	logger.Debug(i18n.T(ctx, "auth.admin_check_success"))
}

// GetCurrentUser 从上下文中获取当前用户
func GetCurrentUser(ctx *gin.Context) *db.User {
	if user, exists := ctx.Get("currentUser"); exists {
		return user.(*db.User)
	}
	return nil
}

// GetCurrentUserId 从上下文中获取当前用户ID
func GetCurrentUserId(ctx *gin.Context) int64 {
	if userId, exists := ctx.Get("currentUserId"); exists {
		return userId.(int64)
	}
	return -1
}

// GetCurrentUserRole 从上下文中获取当前用户角色
func GetCurrentUserRole(ctx *gin.Context) int {
	if role, exists := ctx.Get("currentUserRole"); exists {
		return role.(int)
	}
	return -1
}
