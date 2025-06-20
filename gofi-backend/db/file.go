package db

type File struct {
	Name         string `json:"name"`         // 文件名
	IsDirectory  bool   `json:"isDirectory"`  // 是否是文件夹
	Size         int    `json:"size"`         // 大小
	Extension    string `json:"extension"`    // 扩展名
	Mime         string `json:"mime"`         // 媒体类型
	Path         string `json:"path"`         // 相对路径(相对于storagePath)
	LastModified int64  `json:"lastModified"` // 最后修改时间 Unix Timestamp seconds
	Content      string `json:"content"`      //只有文件有内容显示
	FileType     string `json:"fileType"`     // 文件类型: text, code, image, video, audio, pdf, archive, document, other
	IconType     string `json:"iconType"`     // 图标类型: folder, text, code, image, video, audio, pdf, archive, document, file
}

// FileResponse 统一的文件/目录响应结构体
type FileResponse struct {
	Type string      `json:"type"` // "file" 或 "directory"
	Data interface{} `json:"data"` // 具体的数据结构
}

// DirectoryData 目录数据结构
type DirectoryData struct {
	Path  string `json:"path"`  // 目录路径
	Files []File `json:"files"` // 目录下的文件列表
}

// FileData 文件数据结构
type FileData struct {
	File File `json:"file"` // 文件信息
}
