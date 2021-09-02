package boot

import (
	"flag"
)

const (
	//DefaultPort default port to listen Gofi监听的默认端口号
	DefaultPort = "8080"
	portUsage   = "port to expose web services"
)

// Argument BootArgument 上下文对象
type Argument struct {
	Port string
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
		isFlagBind = true
	}
}

// ParseArguments  只能调用一次
func ParseArguments() {
	flag.Parse()
}

// GetArguments GetDB 返回当前Context实例
func GetArguments() *Argument {
	return argument
}
