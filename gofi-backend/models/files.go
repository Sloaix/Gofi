package models

type File struct {
	Name        string `json:"name"`        // 文件名
	IsDirectory bool   `json:"isDirectory"` // 是否是文件夹
	Size        int    `json:"size"`        // 大小
	Extension   string `json:"extension"`   // 扩展名
	Path        string `json:"path"`        // 相对路径(相对于storagePath)
}
