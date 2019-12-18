package env

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
