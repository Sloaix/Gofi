package main

import (
	"github.com/didip/tollbooth"
	"github.com/iris-contrib/middleware/cors"
	"github.com/iris-contrib/middleware/tollboothic"
	"github.com/kataras/iris"
	"github.com/kataras/iris/core/router"
	"github.com/kataras/iris/middleware/logger"
	"github.com/kataras/iris/middleware/recover"
	"github.com/sirupsen/logrus"
	"gofi/binary"
	"gofi/boot"
	"gofi/controller"
	"gofi/db"
	"gofi/env"
	"gofi/extension"
	"gofi/middleware"
	"strings"
)

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
	setup(app)
	spa(app)
	api(app)
	return
}

func setup(app *iris.Application) {
	app.Logger().SetLevel("debug")
	app.Use(middleware.LanguageHandler)
	app.Use(iris.Gzip)
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

// dynamic replace server ip address for index.html static assets.
func AssetProxy(name string) ([]byte, error) {
	assetsBytes, err := binary.Asset(name)

	if err != nil {
		return nil, err
	}

	if indexHtmlName := "public/index.html"; name == indexHtmlName {
		indexHtmlString := strings.Replace(string(assetsBytes[:]), ApiIpAddressInFrontend, boot.GetArguments().ServerAddress, -1)
		assetsBytes = []byte(indexHtmlString)
		logrus.Info("server ip address replace success")
	}

	return assetsBytes, nil
}

// single page application
func spa(app *iris.Application) {
	// set static assets
	app.RegisterView(iris.HTML("./public", ".html").Binary(AssetProxy, binary.AssetNames))
	app.HandleDir("/", "./public", router.DirOptions{
		Asset:      AssetProxy,
		AssetInfo:  binary.AssetInfo,
		AssetNames: binary.AssetNames,
		Gzip:       true,
	})

	// spa route 404 handle
	app.OnErrorCode(404, func(ctx iris.Context) {
		ctx.StatusCode(200)
		if err := ctx.View("index.html"); err != nil {
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
}
