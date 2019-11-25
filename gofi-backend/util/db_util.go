package util

import (
	"github.com/go-xorm/xorm"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
	"gofi/models"
)

var engineInstance *xorm.Engine

func init() {
	// 连接到数据库
	engine, err := xorm.NewEngine("sqlite3", GetDatabaseName())
	if err != nil {
		logrus.Println(err)
		panic("failed to connect database")
	}

	// 自动迁移表结构,自动增加缺失的字段或者表
	if !IsTestEnvironment() {
		if err := engine.Sync2(new(models.Settings)); err != nil {
			logrus.Error(err)
		}
	}

	engineInstance = engine
}

func GetDatabaseName() string {
	return GetAppName() + ".db"
}

func GetDB() *xorm.Engine {
	return engineInstance
}
