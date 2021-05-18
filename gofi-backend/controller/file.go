package controller

import (
	"github.com/kataras/iris/v12"
	"github.com/sirupsen/logrus"
	"gofi/db"
	"gofi/i18n"
	"gofi/tool"
	"io/ioutil"
	"mime"
	"os"
	"path/filepath"
	"strings"
)

//GetStorageDir 获取当前仓储目录
func GetStorageDir() string {
	configuration := db.ObtainConfiguration()
	if len(configuration.CustomStoragePath) == 0 {
		return tool.GetDefaultStorageDir()
	}
	return configuration.CustomStoragePath
}

func FileDetail(ctx iris.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.URLParamDefault("path", "")

	storagePath := GetStorageDir()

	logrus.Printf("root path is %v \n", storagePath)

	path := filepath.Join(storagePath, relativePath)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storagePath) {
		_, _ = ctx.JSON(NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.OperationNotAllowedInPreviewMode)).Build())
		return
	}

	if !tool.FileExist(path) {
		_, _ = ctx.JSON(NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.DirIsNotExist, path)).Build())
		return
	}

	// 读取该文件信息
	fileInfo, err := os.Stat(path)

	// 读取失败
	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message(err.Error()).Build())
		return
	}

	content := ""
	if tool.IsTextFile(path) {
		bytes, err := ioutil.ReadFile(path)
		if err == nil {
			content = string(bytes[:])
		}
	}

	// 实例化File model
	file := db.File{
		IsDirectory:  fileInfo.IsDir(),
		Name:         fileInfo.Name(),
		Size:         int(fileInfo.Size()),
		Extension:    strings.TrimLeft(filepath.Ext(fileInfo.Name()), "."),
		Mime:         mime.TypeByExtension(filepath.Ext(fileInfo.Name())),
		Path:         path,
		LastModified: fileInfo.ModTime().Unix(),
		Content:      content,
	}

	_, _ = ctx.JSON(NewResource().Payload(file).Build())

	return
}

//ListFiles 返回给定路径文件夹的一级子节点文件
func ListFiles(ctx iris.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.URLParamDefault("path", "")

	storageDir := GetStorageDir()

	logrus.Printf("root path is %v \n", storageDir)

	path := filepath.Join(storageDir, relativePath)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storageDir) {
		_, _ = ctx.JSON(NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.DirIsNotExist)).Build())
		return
	}

	if !tool.FileExist(path) {
		_, _ = ctx.JSON(NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.DirIsNotExist, path)).Build())
		return
	}

	if !tool.IsDirectory(path) {
		_, _ = ctx.JSON(NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.IsNotDir, path)).Build())
		return
	}

	// 读取该文件夹下所有文件
	fileInfos, err := ioutil.ReadDir(path)

	// 读取失败
	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message(err.Error()).Build())
		return
	}

	var filesOfDir []db.File

	// 将所有文件再次封装成客户端需要的数据格式
	for _, fileInfo := range fileInfos {

		// 当前文件是隐藏文件(以.开头)则不显示
		if tool.IsHiddenFile(fileInfo.Name()) {
			continue
		}

		// 实例化File model
		file := db.File{
			IsDirectory:  fileInfo.IsDir(),
			Name:         fileInfo.Name(),
			Size:         int(fileInfo.Size()),
			Extension:    strings.TrimLeft(filepath.Ext(fileInfo.Name()), "."),
			Path:         filepath.Join(relativePath, fileInfo.Name()),
			Mime:         mime.TypeByExtension(filepath.Ext(fileInfo.Name())),
			LastModified: fileInfo.ModTime().Unix(),
		}

		// 添加到切片中等待json序列化
		filesOfDir = append(filesOfDir, file)
	}

	_, _ = ctx.JSON(NewResource().Payload(filesOfDir).Build())

	return
}

//Upload 上传文件
func Upload(ctx iris.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.URLParamDefault("path", "")

	logrus.Infof("relativePath path is %v \n", relativePath)

	storageDir := GetStorageDir()

	logrus.Infof("root path is %v \n", storageDir)

	destDirectory := filepath.Join(storageDir, relativePath)

	logrus.Infof("destPath path is %v \n", destDirectory)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(destDirectory, storageDir) {
		_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.UploadFailed)).Build())
		return
	}

	err := ctx.Request().ParseMultipartForm(ctx.Application().ConfigurationReadOnly().GetPostMaxMemory())
	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.UploadFailed)).Build())
		return
	}

	if ctx.Request().MultipartForm != nil {
		if fileHeaders := ctx.Request().MultipartForm.File; fileHeaders != nil {
			for _, files := range fileHeaders {
				for _, file := range files {

					if tool.FileExist(filepath.Join(destDirectory, file.Filename)) {
						_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.CanNotOverlayExistFile, file.Filename)).Build())
						return
					}

					_, err := tool.UploadFileTo(file, destDirectory)
					if err != nil {
						_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.UploadFailed)).Build())
						return
					}
				}
			}
		}
	}

	_, _ = ctx.JSON(NewResource().Build())
	return
}

//Download 下载文件
func Download(ctx iris.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.URLParamDefault("path", "")
	raw := ctx.URLParamExists("raw") && ctx.URLParam("raw") == "true"

	storageDir := GetStorageDir()

	path := filepath.Join(storageDir, relativePath)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storageDir) {
		_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.FileIsNotExist)).Build())
		return
	}

	if !tool.FileExist(path) {
		_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.FileIsNotExist, path)).Build())
		return
	}

	if tool.IsDirectory(path) {
		_, _ = ctx.JSON(NewResource().Fail().Message(i18n.Translate(i18n.IsNotFile)).Build())
		return
	}

	filename := filepath.Base(path)
	contentType := tool.ParseFileContentType(filename)
	ctx.ContentType(contentType)

	if !raw {
		ctx.Header("Content-Disposition", "attachment;filename="+filename)
	}

	_ = ctx.ServeFile(path)
}
