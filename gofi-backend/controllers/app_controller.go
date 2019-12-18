package controllers

import (
	"github.com/kataras/iris"
	"github.com/sirupsen/logrus"
	"gofi/context"
	"gofi/env"
	"gofi/i18n"
	"gofi/util"
	"path/filepath"
)

//UpdateSetting 更新设置
func UpdateSetting(ctx iris.Context) {
	// 初始化完成且处于Preview环境,不允许更改设置项
	if env.IsPreview() && context.Get().GetSettings().Initialized {
		ctx.JSON(ResponseFailWithMessage(i18n.Translate(i18n.OperationNotAllowedInPreviewMode)))
		return
	}

	appSettings := context.Get().GetSettings()
	appSettings.Initialized = true

	// 用客户端给定的AppInfo覆盖数据库持久化的AppInfo
	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.ReadJSON(&appSettings); ctx.GetContentLength() != 0 && err != nil {
		logrus.Error(err)
		ctx.JSON(ResponseFailWithMessage(err.Error()))
	}

	path := filepath.Clean(appSettings.CustomStoragePath)
	workDir := context.Get().WorkDir
	defaultStorageDir := context.Get().DefaultStorageDir

	// 是否使用默认地址
	useDefaultDir := path == "" || path == defaultStorageDir

	logrus.Printf("工作目录是%v \n", workDir)
	logrus.Printf("dir目录是%v \n", path)

	// xorm 默认不回更新bool字段，这里需要使用UseBool方法
	db := context.Get().Orm.UseBool()

	if useDefaultDir {
		// 如果文件夹不存在，创建文件夹
		util.MkdirIfNotExist(defaultStorageDir)

		// 写入到配置文件
		_, _ = db.After(context.Get().AfterUpdateSettings).Update(&appSettings)

		logrus.Infof("use default path %s, setup success", defaultStorageDir)

		GetSetting(ctx)
	} else {
		// 判断给定的目录是否存在
		if !util.FileExist(path) {
			ctx.JSON(ResponseFailWithMessage(i18n.Translate(i18n.DirIsNotExist, path)))
			return
		}

		// 判断给定的路径是否是目录
		if !util.IsDirectory(path) {
			ctx.JSON(ResponseFailWithMessage(i18n.Translate(i18n.IsNotDir, path)))
			return
		}

		// 更新配置文件的仓库目录
		appSettings.CustomStoragePath = path

		// 写入到配置文件
		_, _ = db.After(context.Get().AfterUpdateSettings).Update(&appSettings)

		// 路径合法，初始化成功，持久化该路径。
		logrus.Infof("setup success,storage path is %s", path)
		GetSetting(ctx)
	}

}

//Setup 初始化
func Setup(ctx iris.Context) {
	// 已经初始化过
	if context.Get().GetSettings().Initialized {
		ctx.JSON(ResponseFailWithMessage(i18n.Translate(i18n.GofiIsAlreadyInitialized)))
		return
	}

	UpdateSetting(ctx)
}

//GetSetting 获取设置项
func GetSetting(ctx iris.Context) {
	settings := context.Get().GetSettings()
	ctx.JSON(ResponseSuccess(settings))
}
