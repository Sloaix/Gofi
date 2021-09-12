package tool

import (
	"crypto/sha1"
	"encoding/hex"
	"github.com/gabriel-vasile/mimetype"
	"golang.org/x/tools/godoc/util"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func FileExist(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		return os.IsExist(err)
	}
	return true
}

func IsDirectory(filename string) bool {
	info, err := os.Stat(filename)
	if err != nil {
		return false
	}
	return info.IsDir()
}

func IsHiddenFile(name string) bool {
	if strings.TrimSpace(name) == "" {
		return false
	}

	return strings.HasPrefix(name, ".")
}

func IsFile(filename string) bool {
	info, err := os.Stat(filename)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

// MkdirIfNotExist 创建文件夹如果不存在
func MkdirIfNotExist(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		_ = os.Mkdir(path, os.ModePerm)
	}
}

// MkFileIfNotExist 创建文件如果不存在
func MkFileIfNotExist(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		_, _ = os.Create(path)
	}
}

func UploadFileTo(fh *multipart.FileHeader, destDirectory string) (int64, error) {
	src, err := fh.Open()
	if err != nil {
		return 0, err
	}
	defer src.Close()

	out, err := os.OpenFile(filepath.Join(destDirectory, fh.Filename),
		os.O_WRONLY|os.O_CREATE, os.FileMode(0666))
	if err != nil {
		return 0, err
	}
	defer out.Close()

	return io.Copy(out, src)
}

func IsTextFile(filepath string) bool {
	f, err := os.Open(filepath)
	if err != nil {
		return false
	}
	defer f.Close()

	var buf [1024]byte
	n, err := f.Read(buf[0:])
	if err != nil {
		return false
	}

	return util.IsText(buf[0:n])
}

// ParseFileContentType 根据扩展名解析文件的类型
func ParseFileContentType(file *os.File) string {
	// 一般用前512字节来识别文件头
	buffer := make([]byte, 512)

	_, err := file.Read(buffer)
	if err != nil {
		return ""
	}

	// 如果无法识别有效的文件类型,会直接返回 "application/octet-stream"
	contentType := http.DetectContentType(buffer)

	// 使用mimetype库进行二次识别
	if contentType == "application/octet-stream" {
		mimeType := mimetype.Detect(buffer)
		contentType = mimeType.String()
	}

	return contentType
}

// Hash 文件摘要算法
func Hash(file *os.File) (hash string, err error) {
	if err != nil {
		return hash, err
	}
	md5hash := sha1.New()
	if _, err := io.Copy(md5hash, file); err != nil {
		return hash, err
	}
	hash = hex.EncodeToString(md5hash.Sum(nil))
	return hash, nil
}
