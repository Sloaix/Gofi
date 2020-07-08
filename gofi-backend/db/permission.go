package db

import "github.com/sirupsen/logrus"

type Category string
type Name string

type Permission struct {
	RoleType RoleType `json:"roleType" xorm:"pk"` // 权限名称 主键，权限名唯一
	Name     Name     `json:"name" xorm:"pk"`     // 权限名称 主键，权限名唯一
	Category Category `json:"category"`           // 权限类别
	Enable   bool     `json:"enable"`
}

// 权限分类
const (
	PageAccess    Category = "PageAccess"    // 页面访问类型
	DataOperation Category = "DataOperation" // 数据操作类型
)

// 页面权限
const (
	FileListPageAccess Name = "FileListPageAccess" // 文件列表页访问权限
)

// 操作权限
const (
	FileUpload   Name = "FileUpload"   // 文件上传权限
	FileDownload Name = "FileDownload" // 文件下载权限
	FilePreview  Name = "FilePreview"  // 文件预览权限
	FileRemove   Name = "FileRemove"   // 文件删除权限
)

var guestPermissionMap = map[Category][]Name{
	PageAccess: {
		FileListPageAccess,
	},
	DataOperation: {
		FileUpload,
		FileDownload,
		FilePreview,
		FileRemove,
	},
}

func createGuestPermissions() []Permission {
	var permissions []Permission

	for category, names := range guestPermissionMap {
		for _, name := range names {
			permissions = append(permissions, Permission{
				RoleType: RoleTypeGuest,
				Name:     name,
				Category: category,
				Enable:   false,
			})
		}
	}
	return permissions
}

func SyncGuestPermissions() {
	count, err := engine.Where("role_type = ?", RoleTypeGuest).Count(new(Permission))
	if err != nil {
		logrus.Errorln(err)
		return
	}

	if count != 0 {
		return
	}

	for _, permission := range createGuestPermissions() {
		_, _ = engine.InsertOne(&permission)
	}
}

// 查询访客的权限
func QueryGuestPermissions() (*[]Permission, error) {
	permissions := make([]Permission, 0)

	err := engine.Where("role_type = ?", RoleTypeGuest).Find(&permissions)

	return &permissions, err
}
