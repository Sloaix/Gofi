package tool

import (
	"crypto/md5"
	"encoding/hex"
	"github.com/dgrijalva/jwt-go"
	"github.com/kataras/iris"
	"strconv"
)

const JWTSecret = "Gofi"

// 生成32位MD5
func MD5(text string) string {
	ctx := md5.New()
	ctx.Write([]byte(text))
	return hex.EncodeToString(ctx.Sum(nil))
}

// 从Header中获取JWT
func ParseJWTFromHeader(ctx iris.Context) *jwt.Token {
	token := ctx.Values().Get("jwt").(*jwt.Token)
	return token
}

// 从JWT中获取用户Id
func ParseUserIdFromJWT(ctx iris.Context) (int64, error) {
	claims := ParseJWTFromHeader(ctx).Claims.(jwt.MapClaims)
	id, err := strconv.Atoi(claims["jti"].(string))
	return int64(id), err
}
