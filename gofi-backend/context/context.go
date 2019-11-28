package context

import (
	"flag"
	"fmt"
	"github.com/go-xorm/xorm"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
	"gofi/models"
	"net"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	Version     = "v0.3.0"
	DefaultPort = "8080"
	portUsage   = "port to expose web services"
	ipUsage     = "server side ip for web client to request,default is lan ip"
)

type Context struct {
	Version           string
	Port              string
	DatabaseName      string
	AppName           string
	ServerAddress     string
	ServerIp          string // server and api ip.
	WorkDir           string
	DefaultStorageDir string
	CustomStorageDir  string
	LogDir            string
	DatabaseFilePath  string
	Orm               *xorm.Engine
	settings          *models.Settings
}

var instance = new(Context)
var isFlagBind = false

func init() {
	bindFlags()
}

func bindFlags() {
	if !isFlagBind {
		flag.StringVar(&instance.Port, "port", DefaultPort, portUsage)
		flag.StringVar(&instance.Port, "p", DefaultPort, portUsage+" (shorthand)")
		flag.StringVar(&instance.ServerIp, "ip", "", ipUsage)
		isFlagBind = true
	}
}

func InitContext() {
	flag.Parse()
	instance.Version = Version
	instance.AppName = "gofi"
	instance.WorkDir = instance.getWorkDirectoryPath()
	instance.DatabaseName = instance.AppName + ".db"
	instance.DatabaseFilePath = filepath.Join(instance.WorkDir, instance.DatabaseName)
	instance.DefaultStorageDir = filepath.Join(instance.WorkDir, "storage")
	instance.LogDir = filepath.Join(instance.WorkDir, "log")

	// 如果ip为空,默认获取局域网ip
	if instance.ServerIp == "" || !CheckIp(instance.ServerIp) {
		instance.ServerIp = instance.GetLanIp()
	}
	instance.ServerAddress = instance.ServerIp + ":" + instance.Port
	instance.Orm = instance.initDatabase()
	instance.settings = instance.queryAppSettings()
	instance.CustomStorageDir = instance.settings.CustomStoragePath
}

func CheckIp(ip string) bool {
	return net.ParseIP(ip) != nil
}

func Get() *Context {
	return instance
}

func (context *Context) GetSettings() models.Settings {
	return *context.settings
}

func (context *Context) GetStorageDir() string {
	if len(context.CustomStorageDir) == 0 {
		return context.DefaultStorageDir
	}
	return context.CustomStorageDir
}

func (context *Context) initDatabase() *xorm.Engine {
	// 连接到数据库
	engine, err := xorm.NewEngine("sqlite3", context.DatabaseFilePath)
	if err != nil {
		logrus.Println(err)
		panic("failed to connect database")
	}

	if context.IsTestEnvironment() {
		logrus.Info("on environment,skip database sync")
	} else {
		// 自动迁移表结构,自动增加缺失的字段或者表
		if err := engine.Sync2(new(models.Settings)); err != nil {
			logrus.Error(err)
		}
	}

	return engine
}

func (context *Context) queryAppSettings() *models.Settings {
	var pSettings = new(models.Settings)
	//获取第一条记录,
	if has, _ := context.Orm.Get(pSettings); !has {
		// 如果不存在就重新创建
		pSettings = &models.Settings{
			AppPath:            context.WorkDir,
			Initialized:        false,
			CustomStoragePath:  "",
			DefaultStoragePath: context.DefaultStorageDir,
			DatabaseFilePath:   context.DatabaseFilePath,
			LogDirectoryPath:   context.LogDir,
			DefaultLanguage:    "zh-CN",
			ThemeStyle:         "light", // light or dark
			ThemeColor:         "#1890FF",
			NavMode:            "top", // top or side
			Created:            time.Time{},
			Updated:            time.Time{},
		}

		if _, err := context.Orm.InsertOne(pSettings); err != nil {
			logrus.Error(err)
		}
	}

	pSettings.Version = context.Version

	return pSettings
}

func (context *Context) AfterUpdateSettings(bean interface{}) {
	context.settings = bean.(*models.Settings)
	context.CustomStorageDir = context.settings.CustomStoragePath
	logrus.Infof("AfterUpdateSettings current storage dir is %s", context.settings.CustomStoragePath)
}

// 判断是否是测试环境
func (context *Context) IsTestEnvironment() bool {
	for _, value := range os.Args {
		if strings.Contains(value, "-test.v") {
			return true
		}
	}
	return false
}

// 获取工作目录
func (context *Context) getWorkDirectoryPath() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}
	return dir
}

// 返回本地ip
func (context *Context) GetLanIp() string {
	addresses, err := net.InterfaceAddrs()

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	for _, address := range addresses {

		// 检查ip地址判断是否回环地址
		if ipNet, ok := address.(*net.IPNet); ok && !ipNet.IP.IsLoopback() {
			if ipNet.IP.To4() != nil {
				return ipNet.IP.String()
			}
		}
	}

	return "127.0.0.1"
}
