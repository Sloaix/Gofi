package db

import "github.com/sirupsen/logrus"

const (
	TypeAdmin   = 0 // 管理员
	TypeUser    = 1 // 用户
	TypeVisitor = 2 // 游客
)

type Role struct {
	Type            int    `json:"type" xorm:"pk"`
	Name            string `json:"name"`
	PermissionTypes []int  `json:"permissionTypes"`
}

// 同步角色数据到数据库
func SyncRoles() {
	count, err := engine.Count(new(Role))
	if err != nil {
		logrus.Errorln(err)
		return
	}

	if count != 0 {
		return
	}

	rolesMap := map[int]string{
		TypeAdmin:   "admin",
		TypeUser:    "user",
		TypeVisitor: "visitor",
	}

	var roles []Role

	for roleType, name := range rolesMap {
		roles = append(roles, Role{
			Type: roleType,
			Name: name,
		})
	}

	for _, role := range roles {
		_, _ = engine.InsertOne(&role)
	}
}

// 为管理员角色添加权限,其余角色默认无任何权限.
func SyncAdminPermissions() {
	var adminRole = new(Role)
	adminRole.PermissionTypes = append(adminRole.PermissionTypes, AllPermissions...)
	_, err := engine.Cols("permission_types").Where("type=?", TypeAdmin).Update(adminRole)
	if err != nil {
		logrus.Println(err)
	}
}
