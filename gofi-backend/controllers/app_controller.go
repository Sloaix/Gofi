package controllers

import (
	"github.com/kataras/iris"
	"github.com/sirupsen/logrus"
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

		logrus.Println("使用默认路径初始化成功")

		GetSetting(ctx)
	} else {
		// 判断给定的目录是否存在
		if !util.FileExist(path) {
			ctx.JSON(ResponseFailWithMessage(path + " 目录不存在,请提交正确的文件夹路径"))
			return
		}

		// 判断给定的路径是否是目录
		if !util.IsDirectory(path) {
			ctx.JSON(ResponseFailWithMessage(path + " 不是目录"))
			return
		}

		// 更新配置文件的仓库目录
		appSettings.CustomStoragePath = path

		// 写入到配置文件
		_, _ = db.Update(&appSettings)

		// 路径合法，初始化成功，持久化该路径。
		logrus.Println("路径合法，初始化成功")
		GetSetting(ctx)
	}

}

// 初始化
func Setup(ctx iris.Context) {
	// 已经初始化过
	if util.GetAppSettings().Initialized {
		ctx.JSON(ResponseFailWithMessage("已经初始化过仓库,若要更改,请直接修改配置文件"))
		return
	}

	UpdateSetting(ctx)
}

func GetSetting(ctx iris.Context) {
	appInfo := util.GetAppSettings()
	ctx.JSON(ResponseSuccess(appInfo))
}
