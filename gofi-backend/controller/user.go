package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/sirupsen/logrus"
	"gofi/db"
	"gofi/env"
	"gofi/i18n"
	"gofi/tool"
	"net/http"
	"strconv"
	"time"
)

func GetUser(ctx *gin.Context) {
	userId, err := tool.ParseUserIdFromJWT(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message("token parse failed").Build())
		return
	}

	logrus.Printf("GetUser: userId is %v", userId)
	user, err := db.QueryUserById(userId)

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message("user not exist").Build())
		return
	}

	ctx.JSON(http.StatusOK, NewResource().Payload(user).Build())
}

func ChangePassword(ctx *gin.Context) {
	if env.IsPreview() {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.OperationNotAllowedInPreviewMode)).Build())
		return
	}

	var passwordChangeParam = new(db.PasswordChangeParam)

	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.BindJSON(passwordChangeParam); ctx.Request.ContentLength != 0 && err != nil {
		logrus.Error(err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Build())
	}

	// todo password and confirm validate

	userId, err := tool.ParseUserIdFromJWT(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message("token parse failed").Build())
		return
	}

	logrus.Printf("GetUser: userId is %v", userId)
	err = db.ChangeUserPassword(userId, tool.MD5(passwordChangeParam.Confirm))

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message("user not exist").Build())
		return
	}

	ctx.JSON(http.StatusOK, NewResource().Success().Build())
}

// Login 登录成功会生成一个jwt返回给请求者
func Login(ctx *gin.Context) {
	var loginBody = new(db.LoginParam)

	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.BindJSON(loginBody); ctx.Request.ContentLength != 0 && err != nil {
		logrus.Error(err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Build())
		return
	}

	// todo validate
	user, err := db.QueryUserByUsername(loginBody.Username)
	if err != nil || tool.MD5(loginBody.Password) != user.Password {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.Translate(i18n.UsernameOrPasswordIsWrong)).Build())
		return
	}

	fmt.Println(user)

	// 生成jwt
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Audience:  "Gofi",
		Issuer:    strconv.Itoa(int(user.RoleType)), // 用户角色
		Subject:   "Gofi",
		Id:        strconv.Itoa(int(user.Id)),                 // 用户ID
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30).Unix(), // 30天后过期
		IssuedAt:  time.Now().Unix(),                          // 签发时间
		NotBefore: time.Now().Unix(),                          // 生效期
	})

	// 使用密码签名,返回字符串
	tokenString, _ := token.SignedString([]byte(tool.JWTSecret))

	ctx.JSON(http.StatusOK, NewResource().Payload(tokenString).Build())
}

// Logout 让jwt过期
func Logout(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, NewResource().Message("logout success").Build())
}
