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
}
