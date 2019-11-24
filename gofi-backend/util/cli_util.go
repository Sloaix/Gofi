package util

import "flag"

var port string

const (
	defaultPort = "8080"
	portUsage   = "port to expose web services"
)

func init() {
	flag.StringVar(&port, "port", defaultPort, portUsage)
	flag.StringVar(&port, "p", defaultPort, portUsage+" (shorthand)")
}

func ParseArgs() {
	flag.Parse()
}

func GetPort() string {
	return port
}
