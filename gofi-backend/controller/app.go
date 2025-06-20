package controller

import (
	"gofi/db"
	"gofi/env"
	"gofi/i18n"
	"gofi/tool"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// UpdateConfiguration 更新设置
func UpdateConfiguration(ctx *gin.Context) {
	configuration := db.ObtainConfiguration()
	// 初始化完成且处于Preview环境,不允许更改设置项
	if env.IsPreview() && configuration.Initialized {
		msg := i18n.T(ctx.Request.Context(), "error.operation_not_allowed_preview")
		tool.GetLogger().Warnf("[Setup] Preview mode, operation not allowed: %s", msg)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(msg).Build())
		return
	}

	configuration.Initialized = true

	// 用客户端给定的Configuration覆盖数据库持久化的Configuration
	if err := ctx.BindJSON(configuration); ctx.Request.ContentLength != 0 && err != nil {
		msg := i18n.T(ctx.Request.Context(), "error.param_parse_failed", err.Error())
		tool.GetLogger().Errorf("[Setup] BindJSON error: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(msg).Build())
		return
	}

	path := configuration.CustomStoragePath
	defaultStorageDir := tool.GetDefaultStorageDir()
	useDefaultDir := path == "" || path == defaultStorageDir

	tool.GetLogger().Infof("[Setup] try to update configuration, path: %v, useDefaultDir: %v", path, useDefaultDir)

	if useDefaultDir {
		tool.MkdirIfNotExist(defaultStorageDir)
		configuration.CustomStoragePath = ""
		db.UpdateConfiguration(configuration)
		tool.GetLogger().Infof("[Setup] use default path %s, setup success", defaultStorageDir)
		GetConfiguration(ctx)
	} else {
		if !tool.FileExist(path) {
			msg := i18n.T(ctx.Request.Context(), "error.directory_not_exist", path)
			tool.GetLogger().Warnf("[Setup] 目录不存在: %s", path)
			ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(msg).Build())
			return
		}
		if !tool.IsDirectory(path) {
			msg := i18n.T(ctx.Request.Context(), "error.not_directory", path)
			tool.GetLogger().Warnf("[Setup] 路径不是目录: %s", path)
			ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(msg).Build())
			return
		}
		configuration.CustomStoragePath = filepath.Clean(path)
		db.UpdateConfiguration(configuration)
		tool.GetLogger().Infof("[Setup] setup success, storage path: %s", path)
		GetConfiguration(ctx)
	}
}

// Setup 初始化
func Setup(ctx *gin.Context) {
	// 已经初始化过
	if db.ObtainConfiguration().Initialized {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "error.already_initialized")).Build())
		return
	}

	UpdateConfiguration(ctx)
}

// GetConfiguration 获取设置项
func GetConfiguration(ctx *gin.Context) {
	configuration := db.ObtainConfiguration()
	ctx.JSON(http.StatusOK, NewResource().Payload(configuration).Build())
}
