package main

import (
	"embed"
	"gofi/boot"
	"gofi/controller"
	"gofi/db"
	"gofi/env"
	"gofi/extension"
	"gofi/middleware"
	"net/http"
	"strings"

	"github.com/didip/tollbooth/v6"
	"github.com/iris-contrib/middleware/cors"
	"github.com/iris-contrib/middleware/tollboothic"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/core/router"
	"github.com/kataras/iris/v12/middleware/logger"
	"github.com/kataras/iris/v12/middleware/recover"
	"github.com/sirupsen/logrus"
)

//go:embed dist/*
var DIST embed.FS
var indexName = "index.html"

const (
	ApiIpAddressInFrontend = "127.0.0.1:8080"
)

func init() {
	extension.BindAdditionalType()
	boot.ParseArguments()
}

func main() {
	logrus.Infof("Gofi is running on %v，current environment is %s,version is %s\n", boot.GetArguments().ServerAddress, env.Current(), db.ObtainConfiguration().Version)
	app := newApp()
	_ = app.Run(iris.Addr(":"+boot.GetArguments().Port), iris.WithoutServerError(iris.ErrServerClosed))
}

func newApp() (app *iris.Application) {
	app = iris.New()
	replaceApiAddress(app)
	setup(app)
	spa(app)
	api(app)
	return
}

// dynamic replace the local api address to product api address for index.html static assets.
func replaceApiAddress(app *iris.Application) {
	// start record.
	app.Use(func(ctx iris.Context) {
		ctx.Record()
		ctx.Next()
	})

	app.Done(func(ctx iris.Context) {
		bodyAsBytes := ctx.Recorder().Body()
		bodyAsString := string(bodyAsBytes)
		if strings.Contains(bodyAsString, ApiIpAddressInFrontend) {
			indexHtml := strings.Replace(bodyAsString, ApiIpAddressInFrontend, boot.GetArguments().ServerAddress, -1)
			ctx.Recorder().SetBodyString(indexHtml)
		}
	})
}

func setup(app *iris.Application) {
	app.Logger().SetLevel("debug")
	app.Use(middleware.LanguageHandler)
	//app.Use(iris.Gzip)
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // allows everything, use that to change the hosts.
		AllowedMethods:   []string{"PUT", "PATCH", "GET", "POST", "OPTIONS", "DELETE"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		AllowCredentials: true,
	}))
}

// single page application
func spa(app *iris.Application) {

	staticAssetFS := iris.PrefixDir("dist", http.FS(DIST))

	// set static assets
	app.RegisterView(iris.HTML(staticAssetFS, ".html"))
	app.HandleDir("/", staticAssetFS, iris.DirOptions{
		IndexName:         indexName,
		PushTargets:       nil,
		PushTargetsRegexp: nil,
		Cache:             router.DirCacheOptions{},
		Compress:          true,
		ShowList:          false,
		DirList:           nil,
		ShowHidden:        false,
		Attachments:       router.Attachments{},
		AssetValidator:    nil,
		SPA:               true,
	})

	// spa route 404 handle
	app.OnErrorCode(404, func(ctx iris.Context) {
		ctx.StatusCode(200)
		if err := ctx.View(indexName); err != nil {
			logrus.Error(err)
		}
	})
}

// api endpoint
func api(app *iris.Application) {
	limiter := tollbooth.NewLimiter(2, nil)

	api := app.Party("/api", func(ctx iris.Context) {
		logrus.Println(limiter)
		// 预览模式下,限制请求频率
		if env.IsPreview() {
			tollboothic.LimitHandler(limiter)(ctx)
		} else {
			ctx.Next()
		}
	}).AllowMethods(iris.MethodOptions)

	{
		api.Get("/configuration", controller.GetConfiguration)
		api.Post("/configuration", middleware.AutHandler, controller.UpdateConfiguration)
		api.Post("/setup", controller.Setup)
		api.Get("/files", controller.ListFiles)
		api.Get("/file", controller.FileDetail)
		api.Get("/download", controller.Download)
		api.Post("/upload", middleware.AutHandler, controller.Upload)
	}

	user := api.Party("/user")
	{
		user.Get("/", middleware.AutHandler, controller.GetUser)
		user.Post("/login", controller.Login)
		user.Post("/logout", middleware.AutHandler, controller.Logout)
		user.Post("/changePassword", middleware.AutHandler, controller.ChangePassword)
	}

	permission := api.Party("/permission", middleware.AdminHandler)
	{
		permission.Get("/guest", controller.GetGuestPermissions)
		permission.Post("/guest", controller.UpdateGuestPermission)
	}
}
