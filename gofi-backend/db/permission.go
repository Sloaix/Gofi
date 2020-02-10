package db

import "github.com/sirupsen/logrus"

const (
	UploadFilePermission          int = iota // 文件上传权限
	DownloadFilePermission                   // 文件下载权限
	ConfigurationUpdatePermission            // 配置修改权限
)

var AllPermissions = []int{
	UploadFilePermission,
	DownloadFilePermission,
	ConfigurationUpdatePermission,
}

type Permission struct {
	Type int    `json:"type" xorm:"pk"`
	Name string `json:"description"`
}

func SyncPermissions() {
	count, err := engine.Count(new(Permission))
	if err != nil {
		logrus.Errorln(err)
		return
	}

	if count != 0 {
		return
	}

	permissionsMap := map[int]string{
		UploadFilePermission:          "upload file permission",
		DownloadFilePermission:        "download file permission",
		ConfigurationUpdatePermission: "configuration update permission",
	}

	var permissions []Permission

	for permissionType, name := range permissionsMap {
		permissions = append(permissions, Permission{
			Type: permissionType,
			Name: name,
		})

		for _, permission := range permissions {
			_, _ = engine.InsertOne(&permission)
		}
	}
}
