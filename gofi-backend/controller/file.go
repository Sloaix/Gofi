package controller

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gofi/db"
	"gofi/i18n"
	"gofi/tool"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const (
	defaultMemory = 32 << 20
)

//GetStorageDir 获取当前仓储目录
func GetStorageDir() string {
	configuration := db.ObtainConfiguration()
	if len(configuration.CustomStoragePath) == 0 {
		return tool.GetDefaultStorageDir()
	}
	return configuration.CustomStoragePath
}

func FileDetail(ctx *gin.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.DefaultQuery("path", "")

	storagePath := GetStorageDir()

	logrus.Printf("root path is %v \n", storagePath)

	path := filepath.Join(storagePath, relativePath)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storagePath) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.OperationNotAllowedInPreviewMode)).Build())
		return
	}

	if !tool.FileExist(path) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.DirIsNotExist, path)).Build())
		return
	}

	// 读取该文件信息
	fileInfo, err := os.Stat(path)

	// 读取失败
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(err.Error()).Build())
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

	ctx.JSON(http.StatusOK, NewResource().Payload(file).Build())

	return
}

//ListFiles 返回给定路径文件夹的一级子节点文件
func ListFiles(ctx *gin.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.DefaultQuery("path", "")

	storageDir := GetStorageDir()

	logrus.Printf("root path is %v \n", storageDir)

	path := filepath.Join(storageDir, relativePath)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storageDir) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.DirIsNotExist)).Build())
		return
	}

	if !tool.FileExist(path) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.DirIsNotExist, path)).Build())
		return
	}

	if !tool.IsDirectory(path) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.Translate(i18n.IsNotDir, path)).Build())
		return
	}

	// 读取该文件夹下所有文件
	fileInfos, err := ioutil.ReadDir(path)

	// 读取失败
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(err.Error()).Build())
		return
	}

	var filesOfDir = make([]db.File, 0)

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

	ctx.JSON(http.StatusOK, NewResource().Payload(filesOfDir).Build())

	return
}

//Upload 上传文件
func Upload(ctx *gin.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.DefaultQuery("path", "")

	logrus.Infof("relativePath path is %v \n", relativePath)

	storageDir := GetStorageDir()

	logrus.Infof("root path is %v \n", storageDir)

	destDirectory := filepath.Join(storageDir, relativePath)

	logrus.Infof("destPath path is %v \n", destDirectory)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(destDirectory, storageDir) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.Translate(i18n.UploadFailed)).Build())
		return
	}
	err := ctx.Request.ParseMultipartForm(defaultMemory)

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.Translate(i18n.UploadFailed)).Build())
		return
	}

	if ctx.Request.MultipartForm != nil {
		if fileHeaders := ctx.Request.MultipartForm.File; fileHeaders != nil {
			for _, files := range fileHeaders {
				for _, file := range files {

					if tool.FileExist(filepath.Join(destDirectory, file.Filename)) {
						ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.Translate(i18n.CanNotOverlayExistFile, file.Filename)).Build())
						return
					}

					_, err := tool.UploadFileTo(file, destDirectory)
					if err != nil {
						ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.Translate(i18n.UploadFailed)).Build())
						return
					}
				}
			}
		}
	}

	ctx.JSON(http.StatusOK, NewResource().Build())
	return
}

//Download 下载文件
func Download(ctx *gin.Context) {
	// 需要列出文件的文件夹地址相对路径
	relativePath := ctx.DefaultQuery("path", "")
	// raw 在浏览器中显示原始文件,但并不下载
	raw := ctx.Query("raw") == "true"

	storageDir := GetStorageDir()

	path := filepath.Join(storageDir, relativePath)

	isHeadRequest := ctx.Request.Method == "HEAD"

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storageDir) {
		_ = ctx.AbortWithError(http.StatusNotFound, errors.New(i18n.Translate(i18n.FileIsNotExist)))
		return
	}

	if !tool.FileExist(path) {
		_ = ctx.AbortWithError(http.StatusNotFound, errors.New(i18n.Translate(i18n.FileIsNotExist)))
		return
	}

	if tool.IsDirectory(path) {
		_ = ctx.AbortWithError(http.StatusNotFound, errors.New(i18n.Translate(i18n.IsNotFile)))
		return
	}

	filename := filepath.Base(path)
	file, err := os.Open(path)
	defer file.Close()

	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	fileInfo, err := file.Stat()
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// 格式化上次修改时间
	lastModified := fileInfo.ModTime().UTC().Format(http.TimeFormat)

	ifRangeHeaderValue := ctx.GetHeader("If-Range")

	// 文件长度，单位是字节
	fileSize := fileInfo.Size()

	rangeHeaderValue := ctx.GetHeader("Range")
	var start, end int64
	_, _ = fmt.Sscanf(rangeHeaderValue, "bytes=%d-%d", &start, &end)
	// 校验start end参数
	if start < 0 || start >= fileSize || end < 0 || end >= fileSize {
		// 参数非法，直接返回响应
		_ = ctx.AbortWithError(http.StatusRequestedRangeNotSatisfiable, errors.New(fmt.Sprintf("out of range, length %d", fileSize)))
		return
	}

	// 返回的格式,<start>-<end-1>/length
	if end == 0 {
		end = fileSize - 1
	}

	if !raw {
		// 当浏览器发现 Accept-Ranges 头时，可以尝试继续中断了的下载，而不是重新开始。see https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept-Ranges
		ctx.Header("Accept-Ranges", "bytes")
		// attachment 意味着消息体应该被下载到本地；大多数浏览器会呈现一个“保存为”的对话框，将 filename 的值预填为下载后的文件名，假如它存在的话。see https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition
		ctx.Header("Content-Disposition", "attachment;filename="+filename)
	}

	ctx.Header("Content-Type", tool.ParseFileContentType(file))
	ctx.Header("Content-Length", strconv.Itoa(int(fileSize)))
	ctx.Header("Last-Modified", lastModified)

	if rangeHeaderValue != "" {
		// 如果ifRange存在，但是匹配不上，直接返回完整文件
		if ifRangeHeaderValue != "" && ifRangeHeaderValue != lastModified {
			ctx.Status(http.StatusOK)
			ctx.File(path)
			return
		} else {
			ctx.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d",
				start,
				end-1,
				fileSize,
			))
			ctx.Status(http.StatusPartialContent)
		}
	}

	// head 请求，无需返回body
	if !isHeadRequest {
		_, err = file.Seek(start, 0)

		if err != nil {
			logrus.Println(err.Error())
			_ = ctx.AbortWithError(http.StatusInternalServerError, errors.New("file seek error"))
			return
		}

		// 写入数据
		_, err = io.CopyN(ctx.Writer, file, end-start+1)

		if err != nil {
			log.Println(err.Error())
			return
		}
	}
}
