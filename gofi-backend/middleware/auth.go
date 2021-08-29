package middleware

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"gofi/controller"
	"gofi/db"
	"gofi/i18n"
	"gofi/tool"
	"net/http"
	"strings"
)

func AuthChecker(ctx *gin.Context) {
	tokenString := strings.TrimSpace(strings.ReplaceAll(ctx.GetHeader("Authorization"), "bearer", ""))

	_, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return []byte(tool.JWTSecret), nil
	})

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Code(controller.StatusTokenInvalid).Message(i18n.Translate(i18n.NotAuthorized)).Build())
	}
}

func AdminChecker(ctx *gin.Context) {
	role, err := tool.ParseRoleTypeFromJWT(ctx)
	userId, _ := tool.ParseUserIdFromJWT(ctx)

	fmt.Printf("role type is %v \n", role)
	fmt.Printf("userId  is %v \n", userId)
	fmt.Printf("error   is %v \n", err)

	if db.RoleTypeAdmin != db.RoleType(role) || err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, controller.NewResource().Fail().Message(i18n.Translate(i18n.NotAuthorized)).Build())
	} else {
		AuthChecker(ctx)
	}
}
