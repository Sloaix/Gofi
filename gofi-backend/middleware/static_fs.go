package middleware

import (
	"embed"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"io/fs"
	"net/http"
	"path"
)

// StaticFS returns a middleware handler that serves static files in the given directory.
func StaticFS(urlPrefix string, targetPath string, staticAssetsFS embed.FS) gin.HandlerFunc {
	distFS, err := fs.Sub(staticAssetsFS, targetPath)
	if err != nil {
		logrus.Fatalf("static.EmbedFolder - Invalid targetPath value - %s", err)
	}
	fileServer := http.FileServer(http.FS(distFS))

	if urlPrefix != "" {
		fileServer = http.StripPrefix(urlPrefix, fileServer)
	}

	return func(c *gin.Context) {
		// 这里获取到url的path需要处理一下,让其从绝对路径转换成相对路径
		filePath := path.Join(".", c.Request.URL.Path)
		_, err := distFS.Open(filePath)

		assetsExist := err == nil
		// 只有文件存在的时候,用静态文件服务处理请求,其余情况都由main.go中的路由处理
		if assetsExist {
			fileServer.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		}
	}
}
