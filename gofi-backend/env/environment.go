package env

import (
	"os"
	"strings"
)

//Mode 模式
type Mode string

const (
	//Development 开发环境
	Development Mode = "DEVELOPMENT"
	//Preview 预览环境
	Preview Mode = "PREVIEW"
	//Production 线上环境
	Production Mode = "PRODUCTION"
)

func IsDevelop() bool {
	return current == Development
}

func IsPreview() bool {
	return current == Preview
}

func IsProduct() bool {
	return current == Production
}

func Current() Mode {
	return current
}

// IsTest 当前是否测试环境
func IsTest() bool {
	for _, value := range os.Args {
		if strings.Contains(value, "-test.v") {
			return true
		}
	}
	return false
}
