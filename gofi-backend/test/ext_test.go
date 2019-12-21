package test

import (
	"gofi/extension"
	"mime"
	"testing"
)

func TestExt(t *testing.T) {
	extension.InitAdditionalExtensionType()
	for key, value := range extension.ExtTypeMap {
		if mime.TypeByExtension(key) != value {
			t.Error("wrong parse for ext " + key)
		}
	}
}

