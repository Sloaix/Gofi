package test

import (
	"testing"

	"gofi/tool"

	"github.com/stretchr/testify/assert"
)

func TestJWTGeneration(t *testing.T) {
	// 测试JWT生成
	userID := int64(1)
	username := "testuser"
	roleType := 1

	token, err := tool.GenerateJWT(userID, username, roleType)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// 测试JWT解析
	parsedUserID, err := tool.ParseUserIdFromJWTString(token)
	assert.NoError(t, err)
	assert.Equal(t, userID, parsedUserID)
}

func TestMD5Hash(t *testing.T) {
	// 测试MD5哈希
	password := "testpassword"
	hashed := tool.MD5(password)

	// 验证哈希不为空且长度正确
	assert.NotEmpty(t, hashed)
	assert.Len(t, hashed, 32) // MD5 哈希长度为32位

	// 验证相同输入产生相同哈希
	hashed2 := tool.MD5(password)
	assert.Equal(t, hashed, hashed2)

	// 验证不同输入产生不同哈希
	hashed3 := tool.MD5("differentpassword")
	assert.NotEqual(t, hashed, hashed3)
}
