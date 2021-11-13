package main

import (
	"github.com/aviddiviner/gin-limit"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gofi/boot"
	"gofi/controller"
	"gofi/db"
	"gofi/env"
	"gofi/extension"
	"gofi/middleware"
	"net/http"
)

func init() {
	extension.BindAdditionalType()
	boot.ParseArguments()
}

func main() {
	logrus.Infof("Gofi is running on %v，current environment is %s,version is %s\n", boot.GetArguments().Port, env.Current(), db.ObtainConfiguration().Version)

	app := gin.Default()

	// 预览模式下,限制请求频率
	if env.IsPreview() {
		app.Use(limit.MaxAllowed(100))
	} else if env.IsProduct() {
		gin.SetMode(gin.ReleaseMode)
	} else if env.IsDevelop() {
		gin.SetMode(gin.DebugMode)
	}

	app.Use(middleware.CORS)

	if !env.IsDevelop() {
		app.Use(middleware.StaticFS("/", "dist", env.EmbedStaticAssets))

		app.NoRoute(func(context *gin.Context) {
			indexBytes, err := env.EmbedStaticAssets.ReadFile("dist/index.html")
			if err != nil {
				logrus.Fatal(err)
			}
			context.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")
			context.String(http.StatusOK, string(indexBytes))
		})
	}

	api := app.Group("/api")
	app.Use(middleware.Language)
	{
		api.GET("/configuration", controller.GetConfiguration)
		api.POST("/configuration", middleware.AuthChecker, controller.UpdateConfiguration)
		api.POST("/setup", controller.Setup)
		api.GET("/files", controller.ListFiles)
		api.GET("/file", controller.FileDetail)
		api.GET("/download", controller.Download)
		api.HEAD("download", controller.Download)
		api.POST("/upload", middleware.AuthChecker, controller.Upload)
	}

	user := api.Group("/user")
	{
		user.GET("", middleware.AuthChecker, controller.GetUser)
		user.POST("/login", controller.Login)
		user.POST("/logout", middleware.AuthChecker, controller.Logout)
		user.POST("/changePassword", middleware.AuthChecker, controller.ChangePassword)
	}

	permission := api.Group("/permission", middleware.AdminChecker)
	{
		permission.GET("/guest", controller.GetGuestPermissions)
		permission.POST("/guest", controller.UpdateGuestPermission)
	}

	_ = app.Run(":" + boot.GetArguments().Port)
}
