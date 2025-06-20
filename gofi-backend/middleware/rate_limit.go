package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// RateLimiter returns a middleware that limits the request rate.
func RateLimiter(r rate.Limit, b int) gin.HandlerFunc {
	limiter := rate.NewLimiter(r, b)
	return func(c *gin.Context) {
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "too many requests"})
			return
		}
		c.Next()
	}
}

// PerIPRateLimiter returns a middleware that limits the request rate on a per-IP basis.
func PerIPRateLimiter(r rate.Limit, b int) gin.HandlerFunc {
	limiters := make(map[string]*rate.Limiter)
	return func(c *gin.Context) {
		limiter, exists := limiters[c.ClientIP()]
		if !exists {
			limiter = rate.NewLimiter(r, b)
			limiters[c.ClientIP()] = limiter
		}
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "too many requests"})
			return
		}
		c.Next()
	}
}
