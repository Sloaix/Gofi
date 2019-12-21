package extension

import (
	"mime"
)

var ExtTypeMap = map[string]string{
	".md":       "text/plain; charset=utf-8",
	".markdown": "text/plain; charset=utf-8",
}

func InitAdditionalExtensionType() {
	for key, value := range ExtTypeMap {
		_ = mime.AddExtensionType(key, value)
	}
}
