package controller

import (
	"errors"
	"fmt"
	"gofi/db"
	"gofi/i18n"
	"gofi/tool"
	"io"
	"io/ioutil"
	"log"
	"math"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	defaultMemory = 32 << 20
)

// GetStorageDir 获取当前仓储目录
func GetStorageDir() string {
	configuration := db.ObtainConfiguration()
	if len(configuration.CustomStoragePath) == 0 {
		return tool.GetDefaultStorageDir()
	}
	return configuration.CustomStoragePath
}

// FetchFile 统一的文件/目录获取接口
func FetchFile(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)

	// 前端传递的是相对于存储根目录的绝对路径
	abstractPath := ctx.DefaultQuery("path", "")

	storagePath := GetStorageDir()

	tool.GetLogger().Infof("storage path is %v \n", storagePath)
	tool.GetLogger().Infof("abstract path is %v \n", abstractPath)

	// 将抽象绝对路径转换为文件系统绝对路径
	var path string
	if abstractPath == "/" {
		// 如果是根路径，使用存储根目录
		path = storagePath
	} else {
		// 将抽象路径转换为文件系统路径
		// 去掉开头的 /，然后与存储根目录拼接
		relativePath := strings.TrimPrefix(abstractPath, "/")
		path = filepath.Join(storagePath, relativePath)
	}

	tool.GetLogger().Infof("final file system path is %v \n", path)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storagePath) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.T(ctx.Request.Context(), "file.not_in_storage", path)).Build())
		return
	}

	if !tool.FileExist(path) {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Code(StatusNotFound).Message(i18n.T(ctx.Request.Context(), "file.not_exist", path)).Build())
		return
	}

	// 读取该文件/目录信息
	fileInfo, err := os.Stat(path)

	// 读取失败
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(err.Error()).Build())
		return
	}

	if fileInfo.IsDir() {
		// 如果是目录，返回目录信息
		directoryData, err := getDirectoryData(path, abstractPath)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(err.Error()).Build())
			return
		}

		response := db.FileResponse{
			Type: "directory",
			Data: directoryData,
		}

		ctx.JSON(http.StatusOK, NewResource().Payload(response).Build())
	} else {
		// 如果是文件，返回文件信息
		fileData, err := getFileData(path, abstractPath, fileInfo)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(err.Error()).Build())
			return
		}

		response := db.FileResponse{
			Type: "file",
			Data: fileData,
		}

		ctx.JSON(http.StatusOK, NewResource().Payload(response).Build())
	}
}

// getDirectoryData 获取目录数据
func getDirectoryData(path, abstractPath string) (*db.DirectoryData, error) {
	// 读取该文件夹下所有文件
	fileInfos, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var filesOfDir = make([]db.File, 0)

	// 将所有文件再次封装成客户端需要的数据格式
	for _, fileInfo := range fileInfos {
		// 当前文件是隐藏文件(以.开头)则不显示
		if tool.IsHiddenFile(fileInfo.Name()) {
			continue
		}

		// 拼接抽象绝对路径，保证以 / 开头
		var absChildPath string
		if abstractPath == "/" {
			// 如果是根路径，直接使用文件名
			absChildPath = "/" + fileInfo.Name()
		} else {
			absChildPath = filepath.Join(abstractPath, fileInfo.Name())
			absChildPath = filepath.Clean("/" + strings.TrimLeft(absChildPath, "/"))
		}

		// 获取文件类型和图标类型
		filePath := filepath.Join(path, fileInfo.Name())
		isTextFile := tool.IsTextFile(filePath)

		// 优先根据文件名判断类型（处理无后缀文件）
		fileType, iconType := tool.GetFileTypeByName(fileInfo.Name())

		// 如果文件名无法判断，则使用扩展名和MIME类型
		if fileType == "other" {
			fileType, iconType = tool.GetFileType(strings.TrimLeft(filepath.Ext(fileInfo.Name()), "."), mime.TypeByExtension(filepath.Ext(fileInfo.Name())), isTextFile)
		}

		// 实例化File model
		file := db.File{
			IsDirectory:  fileInfo.IsDir(),
			Name:         fileInfo.Name(),
			Size:         int(fileInfo.Size()),
			Extension:    strings.TrimLeft(filepath.Ext(fileInfo.Name()), "."),
			Path:         absChildPath, // 这里是抽象绝对路径
			Mime:         mime.TypeByExtension(filepath.Ext(fileInfo.Name())),
			LastModified: fileInfo.ModTime().Unix(),
			FileType:     fileType,
			IconType:     iconType,
		}

		// 添加到切片中等待json序列化
		filesOfDir = append(filesOfDir, file)
	}

	return &db.DirectoryData{
		Path:  abstractPath,
		Files: filesOfDir,
	}, nil
}

// getFileData 获取文件数据
func getFileData(path, abstractPath string, fileInfo os.FileInfo) (*db.FileData, error) {
	content := ""
	isTextFile := tool.IsTextFile(path)
	if isTextFile {
		bytes, err := ioutil.ReadFile(path)
		if err == nil {
			content = string(bytes[:])
		}
	}

	// 获取文件类型和图标类型
	filePath := filepath.Join(path, fileInfo.Name())
	isTextFile = tool.IsTextFile(filePath)

	// 优先根据文件名判断类型（处理无后缀文件）
	fileType, iconType := tool.GetFileTypeByName(fileInfo.Name())

	// 如果文件名无法判断，则使用扩展名和MIME类型
	if fileType == "other" {
		fileType, iconType = tool.GetFileType(strings.TrimLeft(filepath.Ext(fileInfo.Name()), "."), mime.TypeByExtension(filepath.Ext(fileInfo.Name())), isTextFile)
	}

	// 实例化File model
	file := db.File{
		IsDirectory:  fileInfo.IsDir(),
		Name:         fileInfo.Name(),
		Size:         int(fileInfo.Size()),
		Extension:    strings.TrimLeft(filepath.Ext(fileInfo.Name()), "."),
		Mime:         mime.TypeByExtension(filepath.Ext(fileInfo.Name())),
		Path:         abstractPath, // 返回抽象绝对路径
		LastModified: fileInfo.ModTime().Unix(),
		Content:      content,
		FileType:     fileType,
		IconType:     iconType,
	}

	return &db.FileData{
		File: file,
	}, nil
}

// Upload 上传文件
func Upload(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)

	// 前端传递的是相对于存储根目录的绝对路径
	abstractPath := ctx.DefaultQuery("path", "")

	tool.GetLogger().Infof("请求路径: %v", abstractPath)
	tool.GetLogger().Infof("请求方法: %v", ctx.Request.Method)
	tool.GetLogger().Infof("Content-Type: %v", ctx.GetHeader("Content-Type"))

	storageDir := GetStorageDir()

	tool.GetLogger().Infof("存储目录: %v", storageDir)

	// 将抽象绝对路径转换为文件系统绝对路径
	var destDirectory string
	if abstractPath == "/" {
		// 如果是根路径，使用存储根目录
		destDirectory = storageDir
	} else {
		// 将抽象路径转换为文件系统路径
		// 去掉开头的 /，然后与存储根目录拼接
		relativePath := strings.TrimPrefix(abstractPath, "/")
		destDirectory = filepath.Join(storageDir, relativePath)
	}

	tool.GetLogger().Infof("目标目录: %v", destDirectory)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(destDirectory, storageDir) {
		tool.GetLogger().Errorf("路径安全检查失败: %v 不在存储目录 %v 内", destDirectory, storageDir)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "file.upload_failed")).Build())
		return
	}

	// 检查目标目录是否存在
	if !tool.FileExist(destDirectory) {
		tool.GetLogger().Errorf("目标目录不存在: %v", destDirectory)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "file.upload_failed")).Build())
		return
	}

	// 检查目标目录是否为目录
	if !tool.IsDirectory(destDirectory) {
		tool.GetLogger().Errorf("目标路径不是目录: %v", destDirectory)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "file.upload_failed")).Build())
		return
	}

	err := ctx.Request.ParseMultipartForm(defaultMemory)

	if err != nil {
		tool.GetLogger().Errorf("解析multipart表单失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("multipart表单解析成功")

	overwrite := ctx.DefaultQuery("overwrite", "false") == "true"

	if ctx.Request.MultipartForm != nil {
		tool.GetLogger().Infof("MultipartForm不为空")
		if fileHeaders := ctx.Request.MultipartForm.File; fileHeaders != nil {
			tool.GetLogger().Infof("文件头数量: %d", len(fileHeaders))
			for fieldName, files := range fileHeaders {
				tool.GetLogger().Infof("字段名: %v, 文件数量: %d", fieldName, len(files))
				for i, file := range files {
					tool.GetLogger().Infof("处理第 %d 个文件: %v, 大小: %d bytes", i+1, file.Filename, file.Size)

					// 检查文件是否已存在
					finalPath := filepath.Join(destDirectory, file.Filename)
					if tool.FileExist(finalPath) && !overwrite {
						tool.GetLogger().Errorf("文件已存在: %v", finalPath)
						ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "file.cannot_overwrite", file.Filename)).Build())
						return
					}
					// 如果允许覆盖，先删除原文件
					if tool.FileExist(finalPath) && overwrite {
						_ = os.RemoveAll(finalPath)
					}

					tool.GetLogger().Infof("开始上传文件到: %v", finalPath)
					_, err := tool.UploadFileTo(file, destDirectory)
					if err != nil {
						tool.GetLogger().Errorf("文件上传失败: %v", err)
						ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "file.upload_failed")).Build())
						return
					}
					tool.GetLogger().Infof("文件上传成功: %v", file.Filename)
				}
			}
		} else {
			tool.GetLogger().Warnf("MultipartForm.File为空")
		}
	} else {
		tool.GetLogger().Warnf("MultipartForm为空")
	}

	tool.GetLogger().Infof("=== Upload API 完成 ===")
	ctx.JSON(http.StatusOK, NewResource().Build())
}

// Download 下载文件
func Download(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)

	// 前端传递的是相对于存储根目录的绝对路径
	abstractPath := ctx.DefaultQuery("path", "")
	// raw 在浏览器中显示原始文件,但并不下载
	raw := ctx.Query("raw") == "true"

	storageDir := GetStorageDir()

	// 将抽象绝对路径转换为文件系统绝对路径
	var path string
	if abstractPath == "/" {
		// 如果是根路径，使用存储根目录
		path = storageDir
	} else {
		// 将抽象路径转换为文件系统路径
		// 去掉开头的 /，然后与存储根目录拼接
		relativePath := strings.TrimPrefix(abstractPath, "/")
		path = filepath.Join(storageDir, relativePath)
	}

	isHeadRequest := ctx.Request.Method == "HEAD"

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(path, storageDir) {
		_ = ctx.AbortWithError(http.StatusNotFound, errors.New(i18n.T(ctx.Request.Context(), "file.not_exist")))
		return
	}

	if !tool.FileExist(path) {
		_ = ctx.AbortWithError(http.StatusNotFound, errors.New(i18n.T(ctx.Request.Context(), "file.not_exist")))
		return
	}

	if tool.IsDirectory(path) {
		_ = ctx.AbortWithError(http.StatusNotFound, errors.New(i18n.T(ctx, "file.not_file")))
		return
	}

	filename := filepath.Base(path)
	file, err := os.Open(path)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	defer file.Close()

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

	if raw {
		ctx.Header("Content-Disposition", "inline; filename="+filename)
	} else {
		ctx.Header("Accept-Ranges", "bytes")
		ctx.Header("Content-Disposition", "attachment; filename="+filename)
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
			tool.GetLogger().Error(err.Error())
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

// UploadInit 初始化分片上传
func UploadInit(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)

	var req struct {
		Path     string `json:"path"`
		FileName string `json:"fileName"`
		FileSize int64  `json:"fileSize"`
		FileHash string `json:"fileHash"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		tool.GetLogger().Errorf("解析JSON请求失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("请求参数 - 路径: %v, 文件名: %v, 文件大小: %d bytes, 文件哈希: %v",
		req.Path, req.FileName, req.FileSize, req.FileHash)

	storageDir := GetStorageDir()
	tool.GetLogger().Infof("存储目录: %v", storageDir)

	var destDirectory string
	if req.Path == "/" {
		destDirectory = storageDir
	} else {
		relativePath := strings.TrimPrefix(req.Path, "/")
		destDirectory = filepath.Join(storageDir, relativePath)
	}

	tool.GetLogger().Infof("目标目录: %v", destDirectory)

	// 确保该路径只是文件仓库的子路径
	if !strings.Contains(destDirectory, storageDir) {
		tool.GetLogger().Errorf("路径安全检查失败: %v 不在存储目录 %v 内", destDirectory, storageDir)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	// 检查目标目录是否存在
	if !tool.FileExist(destDirectory) {
		tool.GetLogger().Errorf("目标目录不存在: %v", destDirectory)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	// 检查目标目录是否为目录
	if !tool.IsDirectory(destDirectory) {
		tool.GetLogger().Errorf("目标路径不是目录: %v", destDirectory)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	// 生成上传ID
	uploadId := generateUploadId(req.FileHash)
	tool.GetLogger().Infof("生成上传ID: %v", uploadId)

	// 创建临时目录存储分片
	tempDir := filepath.Join(os.TempDir(), "gofi_uploads", uploadId)
	tool.GetLogger().Infof("临时目录: %v", tempDir)

	if err := os.MkdirAll(tempDir, 0755); err != nil {
		tool.GetLogger().Errorf("创建临时目录失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("临时目录创建成功")

	// 计算总分片数
	totalChunks := int(math.Ceil(float64(req.FileSize) / float64(5*1024*1024))) // 5MB chunks
	tool.GetLogger().Infof("总分片数: %d", totalChunks)

	// 保存上传信息
	uploadInfo := map[string]interface{}{
		"uploadId":    uploadId,
		"fileName":    req.FileName,
		"fileSize":    req.FileSize,
		"fileHash":    req.FileHash,
		"destDir":     destDirectory,
		"tempDir":     tempDir,
		"chunks":      make(map[int]bool),
		"totalChunks": totalChunks,
	}

	// 这里应该将uploadInfo保存到数据库或缓存中
	// 为了简化，我们暂时使用内存存储
	uploadSessions[uploadId] = uploadInfo
	tool.GetLogger().Infof("上传会话已保存，当前会话数: %d", len(uploadSessions))

	tool.GetLogger().Infof("=== UploadInit API 完成 ===")
	ctx.JSON(http.StatusOK, NewResource().Payload(map[string]string{
		"uploadId": uploadId,
	}).Build())
}

// UploadChunk 上传分片
func UploadChunk(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)

	uploadId := ctx.PostForm("uploadId")
	chunkIndexStr := ctx.PostForm("chunkIndex")
	fileHash := ctx.PostForm("fileHash") // 暂时不使用，但保留参数

	tool.GetLogger().Infof("分片上传参数 - uploadId: %v, chunkIndex: %v, fileHash: %v", uploadId, chunkIndexStr, fileHash)

	chunkIndex, err := strconv.Atoi(chunkIndexStr)
	if err != nil {
		tool.GetLogger().Errorf("分片索引解析失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("分片索引: %d", chunkIndex)

	// 获取上传信息
	uploadInfo, exists := uploadSessions[uploadId]
	if !exists {
		tool.GetLogger().Errorf("上传会话不存在: %v", uploadId)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("找到上传会话: %v", uploadId)

	// 获取上传的文件
	file, err := ctx.FormFile("chunk")
	if err != nil {
		tool.GetLogger().Errorf("获取分片文件失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("分片文件信息 - 文件名: %v, 大小: %d bytes", file.Filename, file.Size)

	// 保存分片到临时目录
	tempDir := uploadInfo["tempDir"].(string)
	chunkPath := filepath.Join(tempDir, fmt.Sprintf("chunk_%d", chunkIndex))

	tool.GetLogger().Infof("分片保存路径: %v", chunkPath)

	if err := ctx.SaveUploadedFile(file, chunkPath); err != nil {
		tool.GetLogger().Errorf("保存分片文件失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("分片文件保存成功")

	// 标记分片已上传
	chunks := uploadInfo["chunks"].(map[int]bool)
	chunks[chunkIndex] = true

	totalChunks := uploadInfo["totalChunks"].(int)
	uploadedChunks := len(chunks)

	tool.GetLogger().Infof("分片上传进度: %d/%d", uploadedChunks, totalChunks)

	tool.GetLogger().Infof("=== UploadChunk API 完成 ===")
	ctx.JSON(http.StatusOK, NewResource().Build())
}

// UploadComplete 完成分片上传
func UploadComplete(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)

	var req struct {
		UploadId string `json:"uploadId"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		tool.GetLogger().Errorf("解析JSON请求失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("完成上传请求 - uploadId: %v", req.UploadId)

	// 获取上传信息
	uploadInfo, exists := uploadSessions[req.UploadId]
	if !exists {
		tool.GetLogger().Errorf("上传会话不存在: %v", req.UploadId)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	tool.GetLogger().Infof("找到上传会话: %v", req.UploadId)

	// 检查所有分片是否已上传
	chunks := uploadInfo["chunks"].(map[int]bool)
	totalChunks := uploadInfo["totalChunks"].(int)
	uploadedChunks := len(chunks)

	tool.GetLogger().Infof("分片检查 - 已上传: %d, 总数: %d", uploadedChunks, totalChunks)

	if len(chunks) != totalChunks {
		tool.GetLogger().Errorf("分片数量不匹配: 已上传 %d 个，需要 %d 个", len(chunks), totalChunks)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}

	// 合并分片
	fileName := uploadInfo["fileName"].(string)
	destDir := uploadInfo["destDir"].(string)
	tempDir := uploadInfo["tempDir"].(string)

	finalPath := filepath.Join(destDir, fileName)
	tool.GetLogger().Infof("开始合并分片到最终文件: %v", finalPath)

	finalFile, err := os.Create(finalPath)
	if err != nil {
		tool.GetLogger().Errorf("创建最终文件失败: %v", err)
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
		return
	}
	defer finalFile.Close()

	tool.GetLogger().Infof("最终文件创建成功")

	// 按顺序合并分片
	for i := 0; i < totalChunks; i++ {
		chunkPath := filepath.Join(tempDir, fmt.Sprintf("chunk_%d", i))
		tool.GetLogger().Infof("合并分片 %d: %v", i, chunkPath)

		chunkFile, err := os.Open(chunkPath)
		if err != nil {
			tool.GetLogger().Errorf("打开分片文件失败 %d: %v", i, err)
			ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
			return
		}

		written, err := io.Copy(finalFile, chunkFile)
		chunkFile.Close()
		if err != nil {
			tool.GetLogger().Errorf("合并分片失败 %d: %v", i, err)
			ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx, "file.upload_failed")).Build())
			return
		}

		tool.GetLogger().Infof("分片 %d 合并成功，写入 %d bytes", i, written)
	}

	tool.GetLogger().Infof("所有分片合并完成")

	// 清理临时文件
	tool.GetLogger().Infof("开始清理临时目录: %v", tempDir)
	if err := os.RemoveAll(tempDir); err != nil {
		tool.GetLogger().Warnf("清理临时目录失败: %v", err)
	} else {
		tool.GetLogger().Infof("临时目录清理成功")
	}

	// 删除上传会话
	delete(uploadSessions, req.UploadId)
	tool.GetLogger().Infof("上传会话已删除，当前会话数: %d", len(uploadSessions))

	tool.GetLogger().Infof("=== UploadComplete API 完成 ===")
	ctx.JSON(http.StatusOK, NewResource().Build())
}

// 生成上传ID
func generateUploadId(fileHash string) string {
	return fmt.Sprintf("%s_%d", fileHash[:8], time.Now().Unix())
}

// 全局变量存储上传会话（生产环境应该使用数据库或Redis）
var uploadSessions = make(map[string]map[string]interface{})

// DeleteFile 删除文件或文件夹
func DeleteFile(ctx *gin.Context) {
	tool.GetLogger().Infof("API %s %s called", ctx.Request.Method, ctx.Request.URL.Path)

	abstractPath := ctx.DefaultQuery("path", "")
	storageDir := GetStorageDir()

	// 不允许删除根目录
	if abstractPath == "/" || abstractPath == "" {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, NewResource().Fail().Message(i18n.T(ctx, "file.delete_root")).Build())
		return
	}

	// 计算实际文件系统路径
	relativePath := strings.TrimPrefix(abstractPath, "/")
	absPath := filepath.Join(storageDir, relativePath)

	// 路径安全校验，防止越权
	if !strings.HasPrefix(absPath, storageDir) {
		ctx.AbortWithStatusJSON(http.StatusForbidden, NewResource().Fail().Message(i18n.T(ctx, "file.delete_illegal_path")).Build())
		return
	}

	// 检查文件/文件夹是否存在
	if !tool.FileExist(absPath) {
		ctx.AbortWithStatusJSON(http.StatusNotFound, NewResource().Fail().Message(i18n.T(ctx, "file.delete_not_exist")).Build())
		return
	}

	// 删除文件或文件夹
	err := os.RemoveAll(absPath)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, NewResource().Fail().Message(fmt.Sprintf(i18n.T(ctx, "file.delete_failed"), err.Error())).Build())
		return
	}

	ctx.JSON(http.StatusOK, NewResource().Message(i18n.T(ctx, "file.deleted")).Build())
}
