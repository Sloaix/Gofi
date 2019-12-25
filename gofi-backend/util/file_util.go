package util

import (
	"golang.org/x/tools/godoc/util"
	"io"
	"mime"
	"mime/multipart"
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

func IsFile(filename string) bool {
	info, err := os.Stat(filename)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

// 创建文件夹如果不存在
func MkdirIfNotExist(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		_ = os.Mkdir(path, os.ModePerm)
	}
}

// 创建文件如果不存在
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

// 根据扩展名解析文件的类型,默认将文本类型都转换为纯文本,不需要浏览器对其作出解析
func ParseFileContentType(fileName string) string {
	contentType := mime.TypeByExtension(filepath.Ext(fileName))
	if strings.HasPrefix(contentType, "text/") {
		contentType = "text/plain"
	}
	return contentType
}
