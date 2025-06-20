package middleware

import (
	"embed"
	"gofi/tool"
	"io/fs"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// StaticFS returns a middleware handler that serves static files in the given directory.
func StaticFS(urlPrefix string, targetPath string, staticAssetsFS embed.FS) gin.HandlerFunc {
	distFS, err := fs.Sub(staticAssetsFS, targetPath)
	if err != nil {
		tool.Fatalf("static.EmbedFolder - Invalid targetPath value - %s", err)
	}

	// 使用标准的 http.FileServer
	fileServer := http.FileServer(http.FS(distFS))

	return func(c *gin.Context) {
		filePath := path.Join(".", c.Request.URL.Path)
		// 添加日志：请求的静态资源路径
		tool.Info("[StaticFS] 请求静态资源:", filePath)
		_, err := distFS.Open(filePath)

		if err == nil {
			// 命中静态资源，记录日志
			tool.Info("[StaticFS] 命中静态资源:", filePath)
			addCacheHeaders(c)
			fileServer.ServeHTTP(c.Writer, c.Request)
			c.Abort()
			return
		} else {
			// 未命中静态资源，记录日志
			tool.Warn("[StaticFS] 未命中静态资源:", filePath, "err:", err)
		}
		// 未命中时不处理，交由后续NoRoute处理（通常fallback到index.html）
	}
}

// addCacheHeaders 为静态文件添加缓存头
func addCacheHeaders(c *gin.Context) {
	path := c.Request.URL.Path

	// 根据文件类型设置不同的缓存策略
	switch {
	case strings.HasSuffix(path, ".html"):
		// HTML 文件不缓存，确保内容更新
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
	case strings.HasSuffix(path, ".js") || strings.HasSuffix(path, ".css"):
		// JS/CSS 文件缓存 1 年，文件名通常包含 hash
		c.Header("Cache-Control", "public, max-age=31536000, immutable")
	case strings.HasSuffix(path, ".png") || strings.HasSuffix(path, ".jpg") ||
		strings.HasSuffix(path, ".jpeg") || strings.HasSuffix(path, ".gif") ||
		strings.HasSuffix(path, ".svg") || strings.HasSuffix(path, ".ico"):
		// 图片文件缓存 1 个月
		c.Header("Cache-Control", "public, max-age=2592000")
	case strings.HasSuffix(path, ".woff") || strings.HasSuffix(path, ".woff2") ||
		strings.HasSuffix(path, ".ttf") || strings.HasSuffix(path, ".eot"):
		// 字体文件缓存 1 年
		c.Header("Cache-Control", "public, max-age=31536000, immutable")
	default:
		// 其他文件缓存 1 小时
		c.Header("Cache-Control", "public, max-age=3600")
	}

	// 添加 ETag 支持
	c.Header("ETag", `"`+time.Now().Format("20060102150405")+`"`)
}
