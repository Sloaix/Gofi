package main

import (
	"gofi/boot"
	"gofi/controller"
	"gofi/db"
	"gofi/env"
	"gofi/extension"
	"gofi/middleware"
	"gofi/tool"
	"net/http"

	"gofi/i18n"
	"log"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func init() {
	extension.BindAdditionalType()
	boot.ParseArguments()
}

func main() {
	if err := i18n.LoadTranslations(); err != nil {
		log.Fatalf("failed to load i18n translations: %v", err)
	}
	// 记录应用启动日志
	tool.LogStartup(boot.GetArguments().Port, string(env.Current()), db.ObtainConfiguration().Version)

	app := gin.Default()

	// 注册全局中间件
	globalMiddlewares := []gin.HandlerFunc{
		middleware.ErrorHandler(),
		middleware.TraceMiddleware(),
		middleware.IPFilter(),
		middleware.XSSProtection(),
	}
	app.Use(globalMiddlewares...)

	// 添加日志中间件
	config := env.GetConfiguration()
	if config.EnableDebug {
		app.Use(middleware.LoggingMiddlewareWithBody())
	} else {
		app.Use(middleware.LoggingMiddleware())
	}

	// 预览模式下,限制请求频率
	if env.IsPreview() {
		app.Use(middleware.PerIPRateLimiter(rate.Limit(10), 20))
		// tool.Info(i18n.T(ctx, "main.preview_mode_enabled"), config.MaxRequestsPerMinute, i18n.T(ctx, "main.times_per_minute"))
	} else if env.IsProduct() {
		gin.SetMode(gin.ReleaseMode)
		// tool.Info(i18n.T(ctx, "main.production_mode_enabled"))
	} else if env.IsDevelop() {
		gin.SetMode(gin.DebugMode)
		// tool.Info(i18n.T(ctx, "main.development_mode_enabled"))
	}

	app.Use(middleware.CORS)
	app.Use(middleware.Language)

	if !env.IsDevelop() {
		app.Use(middleware.StaticFS("/", "dist", env.EmbedStaticAssets))

		app.NoRoute(func(context *gin.Context) {
			indexBytes, err := env.EmbedStaticAssets.ReadFile("dist/index.html")
			if err != nil {
				// tool.WithError(err).Fatal(i18n.T(ctx, "main.read_static_failed"))
			}
			context.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")
			context.String(http.StatusOK, string(indexBytes))
		})
	}

	// 注册API路由（CSRF保护）
	registerAPIRoutes(app)

	tool.Info("Gofi服务器启动完成，监听端口:", boot.GetArguments().Port)

	err := app.Run(":" + boot.GetArguments().Port)
	if err != nil {
		// tool.WithError(err).Fatal(i18n.T(ctx, "main.server_start_failed"))
	}
}

// registerAPIRoutes 注册API路由
func registerAPIRoutes(app *gin.Engine) {
	api := app.Group("/api")
	{
		// 基础配置路由
		api.GET("/configuration", controller.GetConfiguration)
		api.POST("/configuration", middleware.AuthChecker, middleware.CSRFProtection(), controller.UpdateConfiguration)
		api.POST("/setup", controller.Setup)

		// 文件操作路由
		api.GET("/file", controller.FetchFile)
		api.GET("/download", controller.Download)
		api.HEAD("/download", controller.Download)
		api.POST("/upload", middleware.AuthChecker, middleware.CSRFProtection(), controller.Upload)
		api.POST("/upload/init", middleware.AuthChecker, middleware.CSRFProtection(), controller.UploadInit)
		api.POST("/upload/chunk", middleware.AuthChecker, middleware.CSRFProtection(), controller.UploadChunk)
		api.POST("/upload/complete", middleware.AuthChecker, middleware.CSRFProtection(), controller.UploadComplete)
		api.DELETE("/file", middleware.AuthChecker, middleware.CSRFProtection(), controller.DeleteFile)

		// 用户相关路由
		user := api.Group("/user")
		{
			user.GET("", middleware.AuthChecker, controller.GetUser)
			user.POST("/login", controller.Login)
			user.POST("/logout", middleware.AuthChecker, middleware.CSRFProtection(), controller.Logout)
			user.POST("/changePassword", middleware.AuthChecker, middleware.CSRFProtection(), controller.ChangePassword)
		}

		// 权限管理路由
		permission := api.Group("/permission", middleware.AdminChecker)
		{
			permission.GET("/guest", controller.GetGuestPermissions)
			permission.POST("/guest", middleware.CSRFProtection(), controller.UpdateGuestPermission)
		}
	}
}
