package test

import (
	"mime"
	"testing"

	"gofi/extension"

	"github.com/stretchr/testify/assert"
)

func TestExtensionTypeBinding(t *testing.T) {
	t.Run("扩展类型绑定", func(t *testing.T) {
		extension.BindAdditionalType()
		for key, value := range extension.ExtTypeMap {
			mimeType := mime.TypeByExtension(key)
			assert.Equal(t, value, mimeType, "扩展类型 %s 绑定失败", key)
		}
	})
}

func TestExtensionTypeMap(t *testing.T) {
	t.Run("扩展类型映射", func(t *testing.T) {
		assert.NotEmpty(t, extension.ExtTypeMap)
		assert.Equal(t, "text/plain; charset=utf-8", extension.ExtTypeMap[".md"])
		assert.Equal(t, "text/plain; charset=utf-8", extension.ExtTypeMap[".markdown"])
	})
}

func TestExtensionMimeTypeDetection(t *testing.T) {
	t.Run("扩展MIME类型检测", func(t *testing.T) {
		extension.BindAdditionalType()
		mdType := mime.TypeByExtension(".md")
		assert.Equal(t, "text/plain; charset=utf-8", mdType)
		markdownType := mime.TypeByExtension(".markdown")
		assert.Equal(t, "text/plain; charset=utf-8", markdownType)
		txtType := mime.TypeByExtension(".txt")
		assert.NotEmpty(t, txtType)
	})
}

func TestExtensionTypeConsistency(t *testing.T) {
	t.Run("扩展类型一致性", func(t *testing.T) {
		for ext, mimeType := range extension.ExtTypeMap {
			assert.NotEmpty(t, ext, "扩展名不能为空")
			assert.NotEmpty(t, mimeType, "MIME类型不能为空")
			assert.Contains(t, mimeType, "text/plain", "Markdown文件应该映射为text/plain")
		}
	})
}
