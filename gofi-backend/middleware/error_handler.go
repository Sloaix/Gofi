package middleware

import (
	"gofi/tool"
	"net/http"

	"gofi/i18n"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorHandler 全局错误处理中间件
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				tool.WithField("panic", rec).Error(i18n.T(c, "error.global_panic"))
				c.AbortWithStatusJSON(http.StatusInternalServerError, APIResponse{
					Code:    500,
					Message: i18n.T(c, "error.internal"),
				})
			}
		}()
		c.Next()
		// 捕获 gin 上下文中的 error
		errs := c.Errors
		if len(errs) > 0 {
			tool.WithField("errors", errs).Warn(i18n.T(c, "error.api_warn"))
			c.JSON(http.StatusOK, APIResponse{
				Code:    400,
				Message: errs[0].Error(),
			})
			c.Abort()
		}
	}
}

// Success 统一成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

// Fail 统一失败响应
func Fail(c *gin.Context, code int, msg string) {
	c.JSON(http.StatusOK, APIResponse{
		Code:    code,
		Message: msg,
	})
}
