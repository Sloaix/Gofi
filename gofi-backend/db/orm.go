package db

import (
	"github.com/go-xorm/xorm"
	//import sqlite3 driver
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
	"gofi/env"
	"gofi/tool"
)

var engine *xorm.Engine

func init() {
	engine = createEngine()
	SyncPermissions()
	SyncRoles()
	SyncAdminPermissions()
	SyncAdmin()
}

func createEngine() *xorm.Engine {
	// connect to database
	engine, err := xorm.NewEngine("sqlite3", tool.GetDatabaseFilePath())
	if err != nil {
		logrus.Println(err)
		panic("failed to connect database")
	}

	if env.IsTest() {
		logrus.Info("on environment,skip database sync")
	} else {
		// migrate database
		if err := engine.Sync2(new(Configuration), new(Role), new(User), new(Permission)); err != nil {
			logrus.Error(err)
		}
	}

	if env.IsDevelop() {
		engine.ShowSQL(true)
	}

	return engine
}
