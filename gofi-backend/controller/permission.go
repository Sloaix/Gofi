package controller

import (
	"gofi/db"
	"gofi/i18n"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetGuestPermissions 查询访客权限
func GetGuestPermissions(ctx *gin.Context) {
	permissions, err := db.QueryGuestPermissions()

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, NewResource().Fail().Message(i18n.T(ctx.Request.Context(), "permission.guest_query_failed")).Build())
		return
	}

	ctx.JSON(http.StatusOK, NewResource().Payload(permissions).Build())
}

// UpdateGuestPermission 更新访客权限
func UpdateGuestPermission(ctx *gin.Context) {

}
