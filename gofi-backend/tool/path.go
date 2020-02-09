package tool

import (
	"os"
	"path/filepath"
)


func GetAppName() string {
	return "gofi"
}

func GetDatabaseFileName() string {
	return "gofi.db"
}

func GetDefaultStorageDir() string {
	return filepath.Join(GetWorkDir(), "storage")
}

func GetDatabaseFilePath() string {
	return filepath.Join(GetWorkDir(), GetDatabaseFileName())
}

func GetLogDir() string {
	return filepath.Join(GetWorkDir(), "log")
}

//GetWorkDir 获取工作目录
func GetWorkDir() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}
	return dir
}
