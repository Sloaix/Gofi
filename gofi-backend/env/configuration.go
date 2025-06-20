package env

import (
	"fmt"
	"os"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

// Configuration 应用配置
type Configuration struct {
	// JWT配置
	JWTSecret      string
	JWTExpireHours int

	// 安全配置
	EnableRateLimit      bool
	MaxRequestsPerMinute int

	// 日志配置
	LogLevel    string
	EnableDebug bool
}

var (
	config     *Configuration
	configOnce sync.Once
)

// GetConfiguration 获取应用配置（支持 .env 文件自动加载，单例）
func GetConfiguration() *Configuration {
	configOnce.Do(func() {
		_ = godotenv.Load() // 自动加载 .env 文件，环境变量优先
		config = &Configuration{
			// JWT配置
			JWTSecret:      getEnvOrDefault("GOFI_JWT_SECRET", "GofiSecretKey2024"),
			JWTExpireHours: getEnvIntOrDefault("GOFI_JWT_EXPIRE_HOURS", 24*30), // 默认30天

			// 安全配置
			EnableRateLimit:      getEnvBoolOrDefault("GOFI_ENABLE_RATE_LIMIT", true),
			MaxRequestsPerMinute: getEnvIntOrDefault("GOFI_MAX_REQUESTS_PER_MINUTE", 100),

			// 日志配置
			LogLevel:    getEnvOrDefault("GOFI_LOG_LEVEL", "info"),
			EnableDebug: getEnvBoolOrDefault("GOFI_ENABLE_DEBUG", false),
		}
	})
	return config
}

// getEnvOrDefault 获取环境变量，如果不存在则返回默认值
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvIntOrDefault 获取环境变量并转换为整数，如果不存在则返回默认值
func getEnvIntOrDefault(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := parseInt(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getEnvBoolOrDefault 获取环境变量并转换为布尔值，如果不存在则返回默认值
func getEnvBoolOrDefault(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return strings.ToLower(value) == "true" || value == "1"
	}
	return defaultValue
}

// parseInt 简单的字符串转整数函数
func parseInt(s string) (int, error) {
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}
