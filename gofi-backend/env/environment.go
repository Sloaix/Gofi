package env

//Mode 模式
type Mode string

const (
	//Develop 开发环境
	Develop Mode = "DEVELOP"
	//Preview 预览环境
	Preview Mode = "PREVIEW"
	//Product 线上环境
	Product Mode = "PRODUCT"
)