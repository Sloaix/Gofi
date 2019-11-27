package models

import "time"

type Settings struct {
	Id                 int64     `json:"-"`
	DefaultLanguage    string    `json:"defaultLanguage" validate:"required,oneof=zh-CN en-US"` // 可选 zh-cn,en-US
	ThemeStyle         string    `json:"themeStyle" validate:"required,oneof=dark light"`       // 可选 dark,light
	ThemeColor         string    `json:"themeColor" validate:"required"`                        // 主题色
	NavMode            string    `json:"navMode" validate:"required,oneof=side top"`            // 导航模式,side,top
	CustomStoragePath  string    `json:"customStoragePath"`                                     // 自定义文件仓库路径
	DatabaseFilePath   string    `json:"databaseFilePath"`                                      // 默认数据库文件路径
	LogDirectoryPath   string    `json:"logDirectoryPath"`                                      // 默认日志目录路径
	DefaultStoragePath string    `json:"defaultStoragePath"`                                    // 默认文件仓库路径
	AppPath            string    `json:"storagePath"`                                           // 应用程序所在目录路径
	Initialized        bool      `json:"initialized"`                                           // 是否初始化
	Version            string    `json:"version"`                                               // 应用版本
	Created            time.Time `json:"-" xorm:"created"`                                      // 创建时间
	Updated            time.Time `json:"-" xorm:"updated"`                                      // 更新时间
}
