package controller

import (
	"github.com/kataras/iris/v12"
	"gofi/db"
)

// 查询访客权限
func GetGuestPermissions(ctx iris.Context) {
	permissions, err := db.QueryGuestPermissions()

	if err != nil {
		_, _ = ctx.JSON(NewResource().Fail().Message("guest permissions query failed").Build())
		return
	}

	_, _ = ctx.JSON(NewResource().Payload(permissions).Build())
}

// 更新访客权限
func UpdateGuestPermission(ctx iris.Context) {

}
