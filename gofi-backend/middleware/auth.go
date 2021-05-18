package middleware

import (
	"fmt"
	"github.com/iris-contrib/middleware/jwt"
	"github.com/kataras/iris/v12"
	"gofi/controller"
	"gofi/db"
	"gofi/i18n"
	"gofi/tool"
)

func AutHandler(ctx iris.Context) {
	jwt.New(jwt.Config{
		Extractor: jwt.FromAuthHeader,
		ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
			return []byte(tool.JWTSecret), nil
		},
		Expiration:    true,
		SigningMethod: jwt.SigningMethodHS256,
		ErrorHandler: func(context iris.Context, err error) {
			var code int
			if err == jwt.ErrTokenMissing {
				code = controller.StatusTokenMiss
			} else {
				code = controller.StatusTokenInvalid
			}
			_, _ = context.JSON(controller.NewResource().Code(code).Message(i18n.Translate(i18n.NotAuthorized)).Build())
		},
	}).Serve(ctx)
}

func AdminHandler(ctx iris.Context) {
	role, err := tool.ParseRoleTypeFromJWT(ctx)
	userId, _ := tool.ParseUserIdFromJWT(ctx)

	fmt.Printf("role type is %v \n", role)
	fmt.Printf("userId  is %v \n", userId)
	fmt.Printf("error   is %v \n", err)

	if db.RoleTypeAdmin != db.RoleType(role) || err != nil {
		_, _ = ctx.JSON(controller.NewResource().Fail().Message(i18n.Translate(i18n.NotAuthorized)).Build())
	} else {
		AutHandler(ctx)
	}
}
