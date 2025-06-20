package tool

import (
	"fmt"
	"gofi/env"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Logger 日志接口
type Logger interface {
	Debug(args ...interface{})
	Debugf(format string, args ...interface{})
	Info(args ...interface{})
	Infof(format string, args ...interface{})
	Warn(args ...interface{})
	Warnf(format string, args ...interface{})
	Error(args ...interface{})
	Errorf(format string, args ...interface{})
	Fatal(args ...interface{})
	Fatalf(format string, args ...interface{})

	// 结构化日志
	WithField(key string, value interface{}) Logger
	WithFields(fields map[string]interface{}) Logger
	WithError(err error) Logger
}

// logger 日志实现
type logger struct {
	slogger *slog.Logger
}

// 全局日志实例
var globalLogger Logger

func init() {
	initLogger()
}

// initLogger 初始化日志系统
func initLogger() {
	config := env.GetConfiguration()

	// 设置日志级别
	level := getLogLevel(config.LogLevel)

	// 设置日志格式
	var handler slog.Handler
	opts := &slog.HandlerOptions{
		Level:     level,
		AddSource: config.EnableDebug,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.SourceKey && config.EnableDebug {
				if source, ok := a.Value.Any().(*slog.Source); ok {
					filename := filepath.Base(source.File)
					return slog.String(slog.SourceKey, fmt.Sprintf("%s:%d", filename, source.Line))
				}
			}
			return a
		},
	}

	if config.EnableDebug {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}

	slogger := slog.New(handler)
	globalLogger = &logger{slogger: slogger}
}

// getLogLevel 获取日志级别
func getLogLevel(level string) slog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

// GetLogger 获取全局日志实例
func GetLogger() Logger {
	return globalLogger
}

// 实现Logger接口
func (l *logger) Debug(args ...interface{}) {
	l.slogger.Debug(fmt.Sprint(args...))
}

func (l *logger) Debugf(format string, args ...interface{}) {
	l.slogger.Debug(fmt.Sprintf(format, args...))
}

func (l *logger) Info(args ...interface{}) {
	l.slogger.Info(fmt.Sprint(args...))
}

func (l *logger) Infof(format string, args ...interface{}) {
	l.slogger.Info(fmt.Sprintf(format, args...))
}

func (l *logger) Warn(args ...interface{}) {
	l.slogger.Warn(fmt.Sprint(args...))
}

func (l *logger) Warnf(format string, args ...interface{}) {
	l.slogger.Warn(fmt.Sprintf(format, args...))
}

func (l *logger) Error(args ...interface{}) {
	l.slogger.Error(fmt.Sprint(args...))
}

func (l *logger) Errorf(format string, args ...interface{}) {
	l.slogger.Error(fmt.Sprintf(format, args...))
}

func (l *logger) Fatal(args ...interface{}) {
	l.slogger.Error(fmt.Sprint(args...))
	os.Exit(1)
}

func (l *logger) Fatalf(format string, args ...interface{}) {
	l.slogger.Error(fmt.Sprintf(format, args...))
	os.Exit(1)
}

func (l *logger) WithField(key string, value interface{}) Logger {
	return &logger{slogger: l.slogger.With(key, value)}
}

func (l *logger) WithFields(fields map[string]interface{}) Logger {
	args := make([]interface{}, 0, len(fields)*2)
	for k, v := range fields {
		args = append(args, k, v)
	}
	return &logger{slogger: l.slogger.With(args...)}
}

func (l *logger) WithError(err error) Logger {
	return &logger{slogger: l.slogger.With("error", err)}
}

// 便捷函数
func Debug(args ...interface{}) {
	globalLogger.Debug(args...)
}

func Debugf(format string, args ...interface{}) {
	globalLogger.Debugf(format, args...)
}

func Info(args ...interface{}) {
	globalLogger.Info(args...)
}

func Infof(format string, args ...interface{}) {
	globalLogger.Infof(format, args...)
}

func Warn(args ...interface{}) {
	globalLogger.Warn(args...)
}

func Warnf(format string, args ...interface{}) {
	globalLogger.Warnf(format, args...)
}

func Error(args ...interface{}) {
	globalLogger.Error(args...)
}

func Errorf(format string, args ...interface{}) {
	globalLogger.Errorf(format, args...)
}

func Fatal(args ...interface{}) {
	globalLogger.Fatal(args...)
}

func Fatalf(format string, args ...interface{}) {
	globalLogger.Fatalf(format, args...)
}

// 结构化日志便捷函数
func WithField(key string, value interface{}) Logger {
	return globalLogger.WithField(key, value)
}

func WithFields(fields map[string]interface{}) Logger {
	return globalLogger.WithFields(fields)
}

func WithError(err error) Logger {
	return globalLogger.WithError(err)
}

// 特殊日志函数
func LogRequest(ctx interface{}, method, path string, statusCode int, duration time.Duration) {
	fields := map[string]interface{}{
		"method":      method,
		"path":        sanitizePath(path),
		"status":      statusCode,
		"duration":    duration.String(),
		"duration_ms": duration.Milliseconds(),
	}

	if statusCode >= 400 {
		WithFields(fields).Warn("HTTP Request")
	} else {
		WithFields(fields).Info("HTTP Request")
	}
}

func LogFileOperation(operation, filePath string, size int64, err error) {
	fields := map[string]interface{}{
		"operation": operation,
		"file":      sanitizePath(filePath),
		"size":      size,
	}

	if err != nil {
		WithFields(fields).WithError(err).Error("File Operation Failed")
	} else {
		WithFields(fields).Info("File Operation")
	}
}

func LogUserAction(userId int64, action, details string, err error) {
	fields := map[string]interface{}{
		"user_id": userId,
		"action":  action,
		"details": details,
	}

	if err != nil {
		WithFields(fields).WithError(err).Error("User Action Failed")
	} else {
		WithFields(fields).Info("User Action")
	}
}

func LogAuthEvent(userId int64, username, event string, success bool, err error) {
	fields := map[string]interface{}{
		"user_id":  userId,
		"username": username,
		"event":    event,
		"success":  success,
	}

	if err != nil {
		WithFields(fields).WithError(err).Error("Auth Event Failed")
	} else if success {
		WithFields(fields).Info("Auth Event Success")
	} else {
		WithFields(fields).Warn("Auth Event Failed")
	}
}

// sanitizePath 清理路径信息，移除敏感信息
func sanitizePath(path string) string {
	// 移除查询参数
	if idx := strings.Index(path, "?"); idx != -1 {
		path = path[:idx]
	}

	// 移除路径中的敏感信息
	path = strings.ReplaceAll(path, "/api/", "/")

	return path
}

func LogStartup(port, environment, version string) {
	WithFields(map[string]interface{}{
		"port":        port,
		"environment": environment,
		"version":     version,
	}).Info("Gofi Server Starting")
}

func LogShutdown(reason string) {
	WithField("reason", reason).Info("Gofi Server Shutting Down")
}
