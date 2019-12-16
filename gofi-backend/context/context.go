package context

import (
	"flag"
	"fmt"
	"github.com/go-xorm/xorm"
	//import sqlite3 driver
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
	"gofi/models"
	"net"
	"os"
	"path/filepath"
	"strings"
	"time"
)

//version ,will be replaced at compile time by [-ldflags="-X 'gofi/context.Version=vX.X.X'"]
var version string = "UNKOWN VERSION"

const (
	//DefaultPort default port to listen Gofi监听的默认端口号
	DefaultPort = "8080"
	portUsage   = "port to expose web services"
	ipUsage     = "server side ip for web client to request,default is lan ip"
)

//Context 上下文对象
type Context struct {
	Version           string
	Port              string
	DatabaseName      string
	AppName           string
	ServerAddress     string
	ServerIP          string //ServerIP server side ip for web client to request,default is lan ip
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
		flag.StringVar(&instance.ServerIP, "ip", "", ipUsage)
		isFlagBind = true
	}
}

//InitContext 初始化Context,只能初始化一次
func InitContext() {
	flag.Parse()
	instance.Version = version
	instance.AppName = "gofi"
	instance.WorkDir = instance.getWorkDirectoryPath()
	instance.DatabaseName = instance.AppName + ".db"
	instance.DatabaseFilePath = filepath.Join(instance.WorkDir, instance.DatabaseName)
	instance.DefaultStorageDir = filepath.Join(instance.WorkDir, "storage")
	instance.LogDir = filepath.Join(instance.WorkDir, "log")

	// if ip is empty, obtain lan ip to instead.
	if instance.ServerIP == "" || !CheckIP(instance.ServerIP) {
		instance.ServerIP = instance.GetLanIP()
	}
	instance.ServerAddress = instance.ServerIP + ":" + instance.Port
	instance.Orm = instance.initDatabase()
	instance.settings = instance.queryAppSettings()
	instance.CustomStorageDir = instance.settings.CustomStoragePath
}

//CheckIP 校验IP是否有效
func CheckIP(ip string) bool {
	return net.ParseIP(ip) != nil
}

//Get 返回当前Context实例
func Get() *Context {
	return instance
}

//GetSettings 获取当前设置项
func (context *Context) GetSettings() models.Settings {
	return *context.settings
}

//GetStorageDir 获取当前仓储目录
func (context *Context) GetStorageDir() string {
	if len(context.CustomStorageDir) == 0 {
		return context.DefaultStorageDir
	}
	return context.CustomStorageDir
}

func (context *Context) initDatabase() *xorm.Engine {
	// connect to database
	engine, err := xorm.NewEngine("sqlite3", context.DatabaseFilePath)
	if err != nil {
		logrus.Println(err)
		panic("failed to connect database")
	}

	if context.IsTestEnvironment() {
		logrus.Info("on environment,skip database sync")
	} else {
		// migrate database
		if err := engine.Sync2(new(models.Settings)); err != nil {
			logrus.Error(err)
		}
	}

	return engine
}

func (context *Context) queryAppSettings() *models.Settings {
	var pSettings = new(models.Settings)
	//obtain first record
	if has, _ := context.Orm.Get(pSettings); !has {
		//create new record if there is no record exist
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

//AfterUpdateSettings 设置更新后，需要更新Context上下文中的文件仓储路径
func (context *Context) AfterUpdateSettings(bean interface{}) {
	context.settings = bean.(*models.Settings)
	context.CustomStorageDir = context.settings.CustomStoragePath
	logrus.Infof("AfterUpdateSettings current storage dir is %s", context.settings.CustomStoragePath)
}

//IsTestEnvironment 当前是否测试环境
func (context *Context) IsTestEnvironment() bool {
	for _, value := range os.Args {
		if strings.Contains(value, "-test.v") {
			return true
		}
	}
	return false
}

//getWorkDirectoryPath 获取工作目录
func (context *Context) getWorkDirectoryPath() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}
	return dir
}

//GetLanIP 返回本地ip
func (context *Context) GetLanIP() string {
	addresses, err := net.InterfaceAddrs()

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}


	logrus.Infof("print all ip address: %v\n\t", addresses)

	for _, address := range addresses {
		ipNet, ok := address.(*net.IPNet)

		if !ok || ipNet.IP.IsLoopback() || ipNet.IP.To4() == nil {
			continue
		}

		// 当前ip属于私有地址,直接返回
		if isIpBelongToPrivateIpNet(ipNet.IP) {
			return ipNet.IP.To4().String()
		}
	}

	return "127.0.0.1"
}

// 某个ip是否属于私有网段
func isIpBelongToPrivateIpNet(ip net.IP) bool {
	for _, ipNet := range getInternalIpNetArray() {
		if ipNet.Contains(ip) {
			return true
		}
	}
	return false
}

// 返回私有网段切片
func getInternalIpNetArray() []*net.IPNet {
	var ipNetArrays []*net.IPNet

	for _, ip := range []string{"192.168.0.0/16", "172.16.0.0/12", "10.0.0.0/8"} {
		_, ipNet, _ := net.ParseCIDR(ip)
		ipNetArrays = append(ipNetArrays, ipNet)
	}

	return ipNetArrays
}
