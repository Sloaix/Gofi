package controller

import (
	"github.com/gin-gonic/gin"
	"gofi/db"
	"net/http"
)

// GetGuestPermissions 查询访客权限
func GetGuestPermissions(ctx *gin.Context) {
	permissions, err := db.QueryGuestPermissions()

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message("guest permissions query failed").Build())
		return
	}

	ctx.JSON(http.StatusOK, NewResource().Payload(permissions).Build())
}

// UpdateGuestPermission 更新访客权限
func UpdateGuestPermission(ctx *gin.Context) {

}
