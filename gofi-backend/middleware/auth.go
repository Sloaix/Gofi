package middleware

import (
	"github.com/iris-contrib/middleware/jwt"
	"github.com/kataras/iris"
	"github.com/kataras/iris/context"
	"gofi/controller"
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
		ErrorHandler: func(context context.Context, err error) {
			var code int
			if err == jwt.ErrTokenMissing {
				code = controller.StatusTokenMiss
			} else{
				code = controller.StatusTokenInvalid
			}
			_, _ = context.JSON(controller.NewResource().Code(code).Message(i18n.Translate(i18n.NotAuthorized)).Build())
		},
	}).Serve(ctx)
}
