package controller

import (
	jwt2 "github.com/dgrijalva/jwt-go"
	"github.com/iris-contrib/middleware/jwt"
	"github.com/kataras/iris"
	"github.com/sirupsen/logrus"
	"gofi/db"
	"gofi/i18n"
	"gofi/tool"
	"strconv"
	"time"
)

func GetUser(ctx iris.Context) {
	userId, err := tool.ParseUserIdFromJWT(ctx)
	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message("token parse failed").Build())
		return
	}

	logrus.Printf("GetUser: userId is %v", userId)
	user, err := db.QueryUserById(userId)

	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message("user not exist").Build())
		return
	}

	_, _ = ctx.JSON(NewResource().Payload(user).Build())
}

func ChangePassword(ctx iris.Context) {
	var passwordChangeParam = new(db.PasswordChangeParam)

	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.ReadJSON(passwordChangeParam); ctx.GetContentLength() != 0 && err != nil {
		logrus.Error(err)
		_, _ = ctx.JSON(NewResource().Fail().Build())
	}

	// todo password and confirm validate

	userId, err := tool.ParseUserIdFromJWT(ctx)
	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message("token parse failed").Build())
		return
	}

	logrus.Printf("GetUser: userId is %v", userId)
	err = db.ChangeUserPassword(userId, tool.MD5(passwordChangeParam.Confirm))

	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message("user not exist").Build())
		return
	}

	_, _ = ctx.JSON(NewResource().Success().Build())
}

// 登录成功会生成一个jwt返回给请求者
func Login(ctx iris.Context) {
	var loginBody = new(db.LoginParam)

	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.ReadJSON(loginBody); ctx.GetContentLength() != 0 && err != nil {
		logrus.Error(err)
		_, _ = ctx.JSON(NewResource().Fail().Build())
	}

	// todo validate
	user, err := db.QueryUserByUsername(loginBody.Username)
	if err != nil || tool.MD5(loginBody.Password) != user.Password {
		_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.UsernameOrPasswordIsWrong)).Build())
		return
	}

	// 生成jwt
	token := jwt.NewTokenWithClaims(jwt.SigningMethodHS256, jwt2.StandardClaims{
		Audience:  "Gofi",
		Issuer:    "Gofi",
		Subject:   "Gofi",
		Id:        strconv.Itoa(int(user.Id)),                 // 用户ID
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30).Unix(), // 30天后过期
		IssuedAt:  time.Now().Unix(),                          // 签发时间
		NotBefore: time.Now().Unix(),                          // 生效期
	})

	// 使用密码签名,返回字符串
	tokenString, _ := token.SignedString([]byte(tool.JWTSecret))

	_, _ = ctx.JSON(NewResource().Payload(tokenString).Build())
}

// 让jwt过期
func Logout(ctx iris.Context) {
	_, _ = ctx.JSON(NewResource().Message("logout success").Build())
}
