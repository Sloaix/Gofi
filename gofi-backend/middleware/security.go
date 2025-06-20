package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

// SecurityConfig 安全配置
type SecurityConfig struct {
	// IP 白名单（优先级高于黑名单）
	Whitelist []string
	// IP 黑名单
	Blacklist []string
	// 是否启用 CSRF 保护
	EnableCSRF bool
	// 是否启用 XSS 防护
	EnableXSS bool
}

var (
	securityConfig = &SecurityConfig{
		Whitelist:  []string{},
		Blacklist:  []string{},
		EnableCSRF: true,
		EnableXSS:  true,
	}
	configMutex sync.RWMutex
)

// SetSecurityConfig 设置安全配置
func SetSecurityConfig(config *SecurityConfig) {
	configMutex.Lock()
	defer configMutex.Unlock()
	securityConfig = config
}

// GetSecurityConfig 获取安全配置
func GetSecurityConfig() *SecurityConfig {
	configMutex.RLock()
	defer configMutex.RUnlock()
	return securityConfig
}

// IPFilter IP 过滤中间件
func IPFilter() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		config := GetSecurityConfig()

		// 检查白名单
		if len(config.Whitelist) > 0 {
			if !isIPInList(clientIP, config.Whitelist) {
				logger := GetLogger(c)
				logger.WithField("client_ip", clientIP).Warn("IP 不在白名单中")
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "访问被拒绝",
				})
				return
			}
		}

		// 检查黑名单
		if isIPInList(clientIP, config.Blacklist) {
			logger := GetLogger(c)
			logger.WithField("client_ip", clientIP).Warn("IP 在黑名单中")
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"code":    403,
				"message": "访问被拒绝",
			})
			return
		}

		c.Next()
	}
}

// CSRFProtection CSRF 保护中间件
func CSRFProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		config := GetSecurityConfig()
		if !config.EnableCSRF {
			c.Next()
			return
		}

		// 只对非 GET 请求进行 CSRF 检查
		if c.Request.Method == "GET" {
			c.Next()
			return
		}

		// 检查 Origin 头
		origin := c.GetHeader("Origin")
		referer := c.GetHeader("Referer")

		if origin != "" {
			// 验证 Origin 是否合法
			if !isValidOrigin(origin) {
				logger := GetLogger(c)
				logger.WithField("origin", origin).Warn("CSRF 攻击检测：无效的 Origin")
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "CSRF 保护：无效的请求来源",
				})
				return
			}
		} else if referer != "" {
			// 如果没有 Origin，检查 Referer
			if !isValidReferer(referer) {
				logger := GetLogger(c)
				logger.WithField("referer", referer).Warn("CSRF 攻击检测：无效的 Referer")
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "CSRF 保护：无效的请求来源",
				})
				return
			}
		}

		c.Next()
	}
}

// XSSProtection XSS 防护中间件
func XSSProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		config := GetSecurityConfig()
		if !config.EnableXSS {
			c.Next()
			return
		}

		// 只对非 /api/download 路径设置 X-Frame-Options
		if !strings.HasPrefix(c.Request.URL.Path, "/api/download") {
			c.Header("X-Frame-Options", "DENY")
		}
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';")

		c.Next()
	}
}

// isIPInList 检查 IP 是否在列表中
func isIPInList(clientIP string, ipList []string) bool {
	for _, ip := range ipList {
		if ip == clientIP {
			return true
		}
		// 支持 CIDR 格式
		if strings.Contains(ip, "/") {
			if isIPInCIDR(clientIP, ip) {
				return true
			}
		}
	}
	return false
}

// isIPInCIDR 检查 IP 是否在 CIDR 范围内
func isIPInCIDR(clientIP, cidr string) bool {
	_, ipNet, err := net.ParseCIDR(cidr)
	if err != nil {
		return false
	}

	ip := net.ParseIP(clientIP)
	if ip == nil {
		return false
	}

	return ipNet.Contains(ip)
}

// isValidOrigin 验证 Origin 是否合法
func isValidOrigin(origin string) bool {
	// 这里可以根据实际需求添加更严格的验证
	// 例如：只允许特定的域名
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:5173",
		"https://yourdomain.com",
	}

	for _, allowed := range allowedOrigins {
		if origin == allowed {
			return true
		}
	}

	return false
}

// isValidReferer 验证 Referer 是否合法
func isValidReferer(referer string) bool {
	// 这里可以根据实际需求添加更严格的验证
	// 简单检查是否包含合法域名
	allowedDomains := []string{
		"localhost",
		"yourdomain.com",
	}

	for _, domain := range allowedDomains {
		if strings.Contains(referer, domain) {
			return true
		}
	}

	return false
}
