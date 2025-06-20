package tool

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"gofi/env"
	"time"

	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// getJWTSecret 获取JWT密钥
func getJWTSecret() string {
	config := env.GetConfiguration()
	return config.JWTSecret
}

// getJWTExpireHours 获取JWT过期时间
func getJWTExpireHours() int {
	config := env.GetConfiguration()
	return config.JWTExpireHours
}

// MD5 生成32位MD5
func MD5(text string) string {
	ctx := md5.New()
	ctx.Write([]byte(text))
	return hex.EncodeToString(ctx.Sum(nil))
}

// JWTClaims 自定义JWT声明
type JWTClaims struct {
	UserId   int64  `json:"user_id"`
	Username string `json:"username"`
	RoleType int    `json:"role_type"`
	jwt.RegisteredClaims
}

// GenerateJWT 生成JWT Token
func GenerateJWT(userId int64, username string, roleType int) (string, error) {
	claims := JWTClaims{
		UserId:   userId,
		Username: username,
		RoleType: roleType,
		RegisteredClaims: jwt.RegisteredClaims{
			Audience:  []string{"Gofi"},
			Issuer:    "Gofi",
			Subject:   "Authentication",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(getJWTExpireHours()) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(getJWTSecret()))
}

// ParseJWTFromHeader 从Header中获取并解析JWT
func ParseJWTFromHeader(ctx *gin.Context) (*JWTClaims, error) {
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		return nil, fmt.Errorf("authorization header missing")
	}

	// 支持 "Bearer token" 和 "token" 两种格式
	tokenString := strings.TrimSpace(authHeader)
	if strings.HasPrefix(strings.ToLower(tokenString), "bearer ") {
		tokenString = strings.TrimSpace(tokenString[7:])
	}

	if tokenString == "" {
		return nil, fmt.Errorf("token is empty")
	}

	// 解析JWT
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证签名方法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(getJWTSecret()), nil
	})

	if err != nil {
		Errorf("JWT解析失败: %v", err)
		return nil, fmt.Errorf("invalid token: %v", err)
	}

	// 验证Token
	if !token.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

// ParseUserIdFromJWT 从JWT中获取用户ID
func ParseUserIdFromJWT(ctx *gin.Context) (int64, error) {
	claims, err := ParseJWTFromHeader(ctx)
	if err != nil {
		return -1, err
	}
	return claims.UserId, nil
}

// ParseRoleTypeFromJWT 从JWT中获取用户角色
func ParseRoleTypeFromJWT(ctx *gin.Context) (int, error) {
	claims, err := ParseJWTFromHeader(ctx)
	if err != nil {
		return -1, err
	}
	return claims.RoleType, nil
}

// GetCurrentUserClaims 获取当前用户的JWT声明
func GetCurrentUserClaims(ctx *gin.Context) (*JWTClaims, error) {
	return ParseJWTFromHeader(ctx)
}

// ParseUserIdFromJWTString 从JWT字符串中获取用户ID
func ParseUserIdFromJWTString(tokenString string) (int64, error) {
	// 解析JWT
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证签名方法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(getJWTSecret()), nil
	})

	if err != nil {
		return -1, fmt.Errorf("invalid token: %v", err)
	}

	// 验证Token
	if !token.Valid {
		return -1, fmt.Errorf("token is invalid")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return -1, fmt.Errorf("invalid token claims")
	}

	return claims.UserId, nil
}
