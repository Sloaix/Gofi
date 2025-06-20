package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"gofi/tool"

	"github.com/gin-gonic/gin"
)

const (
	RequestIDKey    = "request_id"
	RequestIDHeader = "X-Request-ID"
)

// TraceMiddleware 为每个请求生成唯一ID并注入到日志上下文
func TraceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 优先使用客户端传递的 request_id，否则生成新的
		requestID := c.GetHeader(RequestIDHeader)
		if requestID == "" {
			requestID = generateRequestID()
		}

		// 设置到 gin 上下文
		c.Set(RequestIDKey, requestID)

		// 设置响应头
		c.Header(RequestIDHeader, requestID)

		// 创建带 request_id 的日志上下文
		logger := tool.WithField("request_id", requestID)
		c.Set("logger", logger)

		c.Next()
	}
}

// GetRequestID 从 gin 上下文获取 request_id
func GetRequestID(c *gin.Context) string {
	if requestID, exists := c.Get(RequestIDKey); exists {
		return requestID.(string)
	}
	return ""
}

// GetLogger 从 gin 上下文获取带 request_id 的 logger
func GetLogger(c *gin.Context) tool.Logger {
	if logger, exists := c.Get("logger"); exists {
		return logger.(tool.Logger)
	}
	return tool.GetLogger()
}

// generateRequestID 生成唯一的请求ID
func generateRequestID() string {
	bytes := make([]byte, 8)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
