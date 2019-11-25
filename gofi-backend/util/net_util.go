package util

import (
	"fmt"
	"net"
	"os"
)

func getLocalIp() string {
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

func GetLocalAddress() string {
	return getLocalIp() + ":" + GetPort()
}
