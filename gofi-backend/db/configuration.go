package db

import (
	"github.com/sirupsen/logrus"
	"gofi/tool"
	"time"
)

type Configuration struct {
	Id                 int64     `json:"-"`
	ThemeStyle         string    `json:"themeStyle" validate:"required,oneof=dark light"` // 可选 dark,light
	NavMode            string    `json:"navMode" validate:"required,oneof=side top"`      // 导航模式,side,top
	CustomStoragePath  string    `json:"customStoragePath"`                               // 自定义文件仓库路径
	Initialized        bool      `json:"initialized"`                                     // 是否初始化
	Created            time.Time `json:"-" xorm:"created"`                                // 创建时间
	Updated            time.Time `json:"-" xorm:"updated"`                                // 更新时间
	LogDirectoryPath   string    `json:"logDirectoryPath" xorm:"-"`                       // 默认日志目录路径
	DatabaseFilePath   string    `json:"databaseFilePath" xorm:"-"`                       // 默认数据库文件路径
	DefaultStoragePath string    `json:"defaultStoragePath"  xorm:"-"`                    // 默认文件仓库路径,动态字段,无需持久化
	Version            string    `json:"version"  xorm:"-"`                               // 应用版本,动态字段,无需持久化
	AppPath            string    `json:"appPath" xorm:"-"`                                // 应用程序所在目录路径,动态字段,无需持久化
}

var configurationCache *Configuration

func UpdateConfiguration(configuration *Configuration) {
	_, err := engine.UseBool().AllCols().Update(configuration)
	if err != nil {
		logrus.Errorln(err)
	} else {
		// 更新缓存
		configurationCache = configuration
	}
}

func ObtainConfiguration() *Configuration {
	if configurationCache != nil {
		return configurationCache
	}

	var config = new(Configuration)
	//obtain first record
	if has, _ := engine.Get(config); !has {
		//create new record if there is no record exist
		config = &Configuration{
			AppPath:            tool.GetWorkDir(),
			Initialized:        false,
			CustomStoragePath:  "",
			DefaultStoragePath: tool.GetDefaultStorageDir(),
			DatabaseFilePath:   tool.GetDatabaseFilePath(),
			LogDirectoryPath:   tool.GetLogDir(),
			ThemeStyle:         "light", // light or dark
			NavMode:            "top",   // top or side
			Created:            time.Time{},
			Updated:            time.Time{},
		}

		if _, err := engine.InsertOne(config); err != nil {
			logrus.Error(err)
		}
	}

	config.Version = version
	config.AppPath = tool.GetWorkDir()
	config.DefaultStoragePath = tool.GetDefaultStorageDir()
	config.DatabaseFilePath = tool.GetDatabaseFilePath()
	config.LogDirectoryPath = tool.GetLogDir()

	if configurationCache != config {
		configurationCache = config
	}

	return config
}
