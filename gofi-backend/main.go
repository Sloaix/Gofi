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
	"gofi/context"
	"gofi/controllers"
	"gofi/env"
	"gofi/util"
)

func init() {
	context.InitContext()
}

func main() {
	logrus.Infof("Gofi is running on %v ，current environment is %s\n", context.Get().ServerAddress, env.Current)
	app := newApp()
	_ = app.Run(iris.Addr(":"+context.Get().Port), iris.WithoutServerError(iris.ErrServerClosed))
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

// single page application
func spa(app *iris.Application) {
	// set static assets
	app.RegisterView(iris.HTML("./public", ".html").Binary(util.AssetProxy, binary.AssetNames))
	app.HandleDir("/", "./public", router.DirOptions{
		Asset:      util.AssetProxy,
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
	limiter := tollbooth.NewLimiter(0.7, nil)
	api := app.Party("/api", func(ctx iris.Context) {
		// 预览模式下,限制请求频率
		if env.Current == env.Preview {
			tollboothic.LimitHandler(limiter)
		} else {
			ctx.Next()
		}
	}).AllowMethods(iris.MethodOptions)
	{
		api.Get("/setting", controllers.GetSetting)
		api.Post("/setting", controllers.UpdateSetting)
		api.Post("/setup", controllers.Setup)
		api.Get("/files", controllers.ListFiles)
		api.Get("/download", controllers.Download)
		api.Post("/upload", controllers.Upload)
	}
}
