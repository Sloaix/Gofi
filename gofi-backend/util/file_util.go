package util

import (
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
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
