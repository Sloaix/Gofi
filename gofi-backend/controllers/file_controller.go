package controllers

import (
	"github.com/kataras/iris"
	"github.com/sirupsen/logrus"
	"gofi/models"
	"gofi/util"
	"io/ioutil"
	"path/filepath"
	"strings"
)

func ListFiles(ctx iris.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.URLParamDefault("path", "")

	storagePath := util.GetCustomStoragePath()

	logrus.Printf("root path is %v \n", storagePath)

	path := filepath.Join(storagePath, relativePath)

	// 确保路径一定是以/开头的绝对路径
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	if !util.FileExist(path) {
		ctx.StatusCode(iris.StatusNotFound)
		ctx.JSON(ResponseFailWithMessage("找不到 " + path))
		return
	}

	if !util.IsDirectory(path) {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(ResponseFailWithMessage(path + " 不是文件夹"))
		return
	}

	// 读取该文件夹下所有文件
	files, err := ioutil.ReadDir(path)

	// 读取失败
	if err != nil {
		ctx.StatusCode(iris.StatusNotFound)
		ctx.JSON(ResponseFailWithMessage(err.Error()))
		return
	}

	var filesOfDir []models.File

	// 将所有文件再次封装成客户端需要的数据格式
	for _, f := range files {

		// 当前文件是隐藏文件(以.开头)则不显示
		if util.IsHiddenFile(f.Name()) {
			continue
		}

		var size int
		if f.IsDir() {
			size = 0
		} else {
			size = int(f.Size())
		}

		// 实例化File model
		file := models.File{
			IsDirectory: f.IsDir(),
			Name:        f.Name(),
			Size:        size,
			Extension:   strings.TrimLeft(filepath.Ext(f.Name()), "."),
			Path:        filepath.Join(relativePath, f.Name()),
		}

		// 添加到切片中等待json序列化
		filesOfDir = append(filesOfDir, file)
	}

	ctx.JSON(ResponseSuccess(filesOfDir))

	return
}

func Upload(ctx iris.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.URLParamDefault("path", "")

	storagePath := util.GetCustomStoragePath()

	logrus.Printf("root path is %v \n", storagePath)

	destDirectory := filepath.Join(storagePath, relativePath)

	logrus.Printf("destPath path is %v \n", destDirectory)

	err := ctx.Request().ParseMultipartForm(ctx.Application().ConfigurationReadOnly().GetPostMaxMemory())
	if err != nil {
		ctx.JSON(ResponseFailWithMessage("上传失败"))
		return
	}

	if ctx.Request().MultipartForm != nil {
		if fileHeaders := ctx.Request().MultipartForm.File; fileHeaders != nil {
			for _, files := range fileHeaders {
				for _, file := range files {

					if util.FileExist(filepath.Join(destDirectory, file.Filename)) {
						ctx.JSON(ResponseFailWithMessage(file.Filename + " 已存在,请更改文件名后重试"))
						return
					}

					_, err := util.UploadFileTo(file, destDirectory)
					if err != nil {
						ctx.JSON(ResponseFailWithMessage("上传失败"))
						return
					}
				}
			}
		}
	}

	ctx.JSON(ResponseSuccess(nil))
	return
}

// 下载文件
func Download(ctx iris.Context) {
	ctx.ReadJSON(map[string]interface{}{"Key": "value"})
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.URLParamDefault("path", "")

	rootPath := util.GetCustomStoragePath()

	logrus.Printf("root path is %v \n", rootPath)

	path := filepath.Join(rootPath, relativePath)

	// 确保路径一定是以/开头的绝对路径
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	if !util.FileExist(path) {
		ctx.JSON(ResponseFailWithMessage("找不到 " + path))
		return
	}

	if util.IsDirectory(path) {
		ctx.JSON(ResponseFailWithMessage(path + " 不是单个文件"))
		return
	}

	filename := filepath.Base(path)

	ctx.SendFile(path, filename)
}
