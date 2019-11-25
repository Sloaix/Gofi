package util

import "flag"

const (
	DefaultPort = "8080"
	portUsage   = "port to expose web services"
)

var port = DefaultPort

func init() {
	flag.StringVar(&port, "port", DefaultPort, portUsage)
	flag.StringVar(&port, "p", DefaultPort, portUsage+" (shorthand)")
}

func ParseArgs() {
	flag.Parse()
}

func GetPort() string {
	return port
}

func ResetPort() {
	port = DefaultPort
}
