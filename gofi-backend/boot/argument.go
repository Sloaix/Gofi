package boot

import (
	"flag"
	"fmt"
	"github.com/sirupsen/logrus"
	"net"
	"os"
)


const (
	//DefaultPort default port to listen Gofi监听的默认端口号
	DefaultPort = "8080"
	portUsage   = "port to expose web services"
	ipUsage     = "server side ip for web client to request,default is lan ip"
)

//BootArgument 上下文对象
type Argument struct {
	Port          string
	ServerAddress string
	ServerIP      string //ServerIP server side ip for web client to request,default is lan ip
}

var argument = new(Argument)
var isFlagBind = false

func init() {
	bindFlags()
}

func bindFlags() {
	if !isFlagBind {
		flag.StringVar(&argument.Port, "port", DefaultPort, portUsage)
		flag.StringVar(&argument.Port, "p", DefaultPort, portUsage+" (shorthand)")
		flag.StringVar(&argument.ServerIP, "ip", "", ipUsage)
		isFlagBind = true
	}
}

//parseBootArguments 只能调用一次
func ParseArguments() {
	flag.Parse()

	// if ip is empty, obtain lan ip to instead.
	if argument.ServerIP == "" || !CheckIP(argument.ServerIP) {
		argument.ServerIP = GetLanIP()
	}
	argument.ServerAddress = argument.ServerIP + ":" + argument.Port
}

//CheckIP 校验IP是否有效
func CheckIP(ip string) bool {
	return net.ParseIP(ip) != nil
}

//GetDB 返回当前Context实例
func GetArguments() *Argument {
	return argument
}

//GetLanIP 返回本地ip
func  GetLanIP() string {
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
