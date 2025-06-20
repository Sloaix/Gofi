package db

import (
	"github.com/go-xorm/xorm"
	//import sqlite3 driver
	"gofi/env"
	tool "gofi/tool"

	_ "github.com/mattn/go-sqlite3"
)

var engine *xorm.Engine

func init() {
	engine = createEngine()
	SyncGuestPermissions()
	SyncAdmin()
}

func createEngine() *xorm.Engine {
	// connect to database
	engine, err := xorm.NewEngine("sqlite3", tool.GetDatabaseFilePath())
	if err != nil {
		tool.GetLogger().Error(err)
		panic("failed to connect database")
	}

	if env.IsTest() {
		tool.GetLogger().Info("on environment,skip database sync")
	} else {
		// migrate database
		if err := engine.Sync2(new(Configuration), new(User), new(Permission)); err != nil {
			tool.GetLogger().Error(err)
		}
	}

	if env.IsDevelop() {
		engine.ShowSQL(true)
	}

	return engine
}

// Engine 获取数据库引擎实例
func Engine() *xorm.Engine {
	return engine
}
