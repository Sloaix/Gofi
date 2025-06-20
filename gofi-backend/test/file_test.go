package test

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"gofi/tool"

	"github.com/stretchr/testify/assert"
)

func TestFileOperations(t *testing.T) {
	t.Run("文件路径操作", func(t *testing.T) {
		path1 := "/path/to"
		path2 := "file.txt"
		expected := "/path/to/file.txt"
		result := filepath.Join(path1, path2)
		assert.Equal(t, expected, result)
		filename := "test.txt"
		ext := filepath.Ext(filename)
		assert.Equal(t, ".txt", ext)
		fullPath := "/path/to/test.txt"
		baseName := filepath.Base(fullPath)
		assert.Equal(t, "test.txt", baseName)
	})
}

func TestMimeTypeDetection(t *testing.T) {
	t.Run("MIME类型检测", func(t *testing.T) {
		testContent := "test content"
		tempFile, err := os.CreateTemp("", "test_*.txt")
		assert.NoError(t, err)
		defer os.Remove(tempFile.Name())
		_, err = tempFile.WriteString(testContent)
		assert.NoError(t, err)
		tempFile.Close()
		content, err := os.ReadFile(tempFile.Name())
		assert.NoError(t, err)
		mimeType := http.DetectContentType(content)
		assert.Contains(t, mimeType, "text/plain")
	})
}

func TestFileTypeDetection(t *testing.T) {
	t.Run("文件类型检测", func(t *testing.T) {
		tests := []struct {
			name     string
			filename string
			content  string
			expected string
		}{
			{"文本文件", "test.txt", "Hello World", "document"},
			{"JSON文件", "test.json", `{"key": "value"}`, "code"},
			{"Go文件", "main.go", "package main", "code"},
			{"README文件", "README", "Project description", "text"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				tmpFile := filepath.Join(t.TempDir(), tt.filename)
				err := os.WriteFile(tmpFile, []byte(tt.content), 0644)
				assert.NoError(t, err)
				fileType, _ := tool.GetFileTypeByName(tt.filename)
				if fileType == "other" {
					ext := strings.TrimPrefix(filepath.Ext(tt.filename), ".")
					fileType, _ = tool.GetFileType(ext, "", tool.IsTextFile(tmpFile))
				}
				assert.Equal(t, tt.expected, fileType)
			})
		}
	})
}

func TestFileExist(t *testing.T) {
	t.Run("FileExist", func(t *testing.T) {
		testFile := filepath.Join(t.TempDir(), "test.txt")
		err := os.WriteFile(testFile, []byte("test"), 0644)
		assert.NoError(t, err)
		assert.True(t, tool.FileExist(testFile))
		assert.False(t, tool.FileExist(filepath.Join(t.TempDir(), "nonexistent.txt")))
	})
}

func TestIsDirectory(t *testing.T) {
	t.Run("IsDirectory", func(t *testing.T) {
		testSubDir := filepath.Join(t.TempDir(), "subdir")
		err := os.Mkdir(testSubDir, 0755)
		assert.NoError(t, err)
		testFile := filepath.Join(t.TempDir(), "test.txt")
		err = os.WriteFile(testFile, []byte("test"), 0644)
		assert.NoError(t, err)
		assert.True(t, tool.IsDirectory(testSubDir))
		assert.False(t, tool.IsDirectory(testFile))
	})
}

func TestIsTextFile(t *testing.T) {
	t.Run("IsTextFile", func(t *testing.T) {
		testDir := t.TempDir()
		textFile := filepath.Join(testDir, "test.txt")
		err := os.WriteFile(textFile, []byte("text content"), 0644)
		assert.NoError(t, err)
		binaryFile := filepath.Join(testDir, "test.bin")
		err = os.WriteFile(binaryFile, []byte{0x00, 0x01, 0x02, 0x03}, 0644)
		assert.NoError(t, err)
		assert.True(t, tool.IsTextFile(textFile))
	})
}

func TestGetFileType(t *testing.T) {
	t.Run("GetFileType", func(t *testing.T) {
		fileType, iconType := tool.GetFileType("txt", "text/plain", true)
		assert.Equal(t, "document", fileType)
		assert.Equal(t, "document", iconType)
		fileType, iconType = tool.GetFileType("jpg", "image/jpeg", false)
		assert.Equal(t, "image", fileType)
		assert.Equal(t, "image", iconType)
		fileType, iconType = tool.GetFileType("mp4", "video/mp4", false)
		assert.Equal(t, "video", fileType)
		assert.Equal(t, "video", iconType)
		fileType, iconType = tool.GetFileType("mp3", "audio/mpeg", false)
		assert.Equal(t, "audio", fileType)
		assert.Equal(t, "audio", iconType)
	})
}

func TestGetFileTypeByName(t *testing.T) {
	t.Run("GetFileTypeByName", func(t *testing.T) {
		fileType, iconType := tool.GetFileTypeByName("README.md")
		assert.Equal(t, "text", fileType)
		assert.Equal(t, "text", iconType)
		fileType, iconType = tool.GetFileTypeByName("Dockerfile")
		assert.Equal(t, "text", fileType)
		assert.Equal(t, "text", iconType)
		fileType, iconType = tool.GetFileTypeByName("Makefile")
		assert.Equal(t, "text", fileType)
		assert.Equal(t, "text", iconType)
		fileType, iconType = tool.GetFileTypeByName("unknown.xyz")
		assert.Equal(t, "other", fileType)
		assert.Equal(t, "file", iconType)
	})
}
