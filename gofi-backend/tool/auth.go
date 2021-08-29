package tool

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"strconv"
	"strings"
)

const JWTSecret = "Gofi"

// MD5 生成32位MD5
func MD5(text string) string {
	ctx := md5.New()
	ctx.Write([]byte(text))
	return hex.EncodeToString(ctx.Sum(nil))
}

// ParseJWTFromHeader 从Header中获取JWT
func ParseJWTFromHeader(ctx *gin.Context) (*jwt.Token, error) {
	tokenString := strings.Replace(ctx.GetHeader("Authorization"), "bearer ", "", -1)

	if tokenString == "" {
		return nil, fmt.Errorf("token nout found")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if _, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return token, nil
	} else {
		return nil, fmt.Errorf("token nout found")
	}
}

// ParseUserIdFromJWT 从JWT中获取用户Id
func ParseUserIdFromJWT(ctx *gin.Context) (int64, error) {
	token, err := ParseJWTFromHeader(ctx)
	if err != nil {
		return -1, err
	}
	claims := token.Claims.(jwt.MapClaims)
	id, err := strconv.Atoi(claims["jti"].(string))
	return int64(id), err
}

// ParseRoleTypeFromJWT 从JWT中获取用户的Role
func ParseRoleTypeFromJWT(ctx *gin.Context) (int, error) {
	token, err := ParseJWTFromHeader(ctx)
	if err != nil {
		return -1, err
	}
	claims := token.Claims.(jwt.MapClaims)
	role, err := strconv.Atoi(claims["iss"].(string))
	return role, err
}
