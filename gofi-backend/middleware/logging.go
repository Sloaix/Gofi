package middleware

import (
	"bytes"
	"time"

	"github.com/gin-gonic/gin"
)

// responseWriter 包装gin.ResponseWriter以捕获响应内容
type responseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w responseWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// LoggingMiddleware 记录请求日志
func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// 使用带 request_id 的 logger
		logger := GetLogger(c)

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		if raw != "" {
			path = path + "?" + raw
		}

		logger.WithFields(map[string]interface{}{
			"method":     method,
			"path":       path,
			"status":     statusCode,
			"latency":    latency.String(),
			"latency_ms": latency.Milliseconds(),
			"client_ip":  clientIP,
		}).Info("HTTP Request")
	}
}

// LoggingMiddlewareWithBody 记录请求日志（包含请求体）
func LoggingMiddlewareWithBody() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// 使用带 request_id 的 logger
		logger := GetLogger(c)

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		if raw != "" {
			path = path + "?" + raw
		}

		logger.WithFields(map[string]interface{}{
			"method":     method,
			"path":       path,
			"status":     statusCode,
			"latency":    latency.String(),
			"latency_ms": latency.Milliseconds(),
			"client_ip":  clientIP,
			"user_agent": c.Request.UserAgent(),
		}).Info("HTTP Request")
	}
}
