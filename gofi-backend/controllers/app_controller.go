package controllers

import (
	"github.com/kataras/iris"
	"github.com/sirupsen/logrus"
	"gofi/i18n"
	"gofi/util"
	"path/filepath"
)

func UpdateSetting(ctx iris.Context) {
	appSettings := util.GetAppSettings()
	appSettings.Initialized = true

	// 用客户端给定的AppInfo覆盖数据库持久化的AppInfo
	// 避免Body为空的时候ReadJson报错,导致后续不能默认初始化，这里用ContentLength做下判断
	if err := ctx.ReadJSON(&appSettings); ctx.GetContentLength() != 0 && err != nil {
		logrus.Error(err)
		ctx.JSON(ResponseFailWithMessage(err.Error()))
	}

	path := filepath.Clean(appSettings.CustomStoragePath)
	workDir := util.GetWorkDirectoryPath()
	defaultStoragePath := util.GetDefaultStoragePath()

	// 是否使用默认地址
	useDefaultDir := path == "" || path == defaultStoragePath

	logrus.Printf("工作目录是%v \n", workDir)
	logrus.Printf("dir目录是%v \n", path)

	// xorm 默认不回更新bool字段，这里需要使用UseBool方法
	db := util.GetDB().UseBool()

	if useDefaultDir {
		// 如果文件夹不存在，创建文件夹
		util.MkdirIfNotExist(defaultStoragePath)

		// 写入到配置文件
		_, _ = db.Update(&appSettings)

		// 变更语言
		i18n.SwitchLanguage(appSettings.DefaultLanguage)

		logrus.Infof("use default path %s, setup success", defaultStoragePath)

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
		_, _ = db.Update(&appSettings)

		// 变更语言
		i18n.SwitchLanguage(appSettings.DefaultLanguage)

		// 路径合法，初始化成功，持久化该路径。
		logrus.Infof("setup success,storage path is %s", path)
		GetSetting(ctx)
	}

}

// 初始化
func Setup(ctx iris.Context) {
	// 已经初始化过
	if util.GetAppSettings().Initialized {
		ctx.JSON(ResponseFailWithMessage(i18n.Translate(i18n.GofiIsAlreadyInitialized)))
		return
	}

	UpdateSetting(ctx)
}

func GetSetting(ctx iris.Context) {
	settings := util.GetAppSettings()
	ctx.JSON(ResponseSuccess(settings))
}
