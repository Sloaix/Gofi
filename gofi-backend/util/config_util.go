package util

import (
	"github.com/sirupsen/logrus"
	"gofi/models"
	"time"
)

func GetAppSettings() models.Settings {
	var settings models.Settings
	//获取第一条记录,
	if has, _ := GetDB().Get(&settings); !has {
		// 如果不存在就重新创建
		settings = models.Settings{
			AppPath:            GetWorkDirectoryPath(),
			Initialized:        false,
			CustomStoragePath:  "",
			DefaultStoragePath: GetDefaultStoragePath(),
			DatabaseFilePath:   GetDataBaseFilePath(),
			LogDirectoryPath:   GetLogDirectoryPath(),
			DefaultLanguage:    "zh-CN",
			ThemeStyle:         "light", // light or dark
			ThemeColor:         "#1890FF",
			NavMode:            "top", // top or side
			Created:            time.Time{},
			Updated:            time.Time{},
		}

		if _, err := GetDB().InsertOne(&settings); err != nil {
			logrus.Error(err)
		}
	}
	return settings
}

func GetAppName() string {
	return "gofi"
}
