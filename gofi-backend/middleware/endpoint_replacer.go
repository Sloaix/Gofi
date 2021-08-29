package middleware

import (
	"bytes"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gofi/boot"
	"strconv"
	"strings"
)

const (
	ApiIpAddressInFrontend = "127.0.0.1:8080"
)

type bodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (writer bodyWriter) WriteToString(str string) (int, error) {
	return writer.body.WriteString(str)
}

func (writer bodyWriter) Write(b []byte) (int, error) {
	return writer.body.Write(b)
}

func EndpointReplacer(c *gin.Context) {
	requestHtml := strings.Contains(c.GetHeader("Accept"), "text/html")
	if !requestHtml {
		return
	}

	// 使用buffer缓存将要写入内容
	bodyWriter := &bodyWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
	c.Writer = bodyWriter
	c.Next()

	responseContentIsHtml := strings.Contains(c.Writer.Header().Get("Content-Type"), "text/html")

	if responseContentIsHtml {
		// 替换掉index.html中的endpoint地址
		modifiedBody := strings.ReplaceAll(bodyWriter.body.String(), ApiIpAddressInFrontend, boot.GetArguments().ServerAddress)

		// 重新计算content length
		contentLength := strconv.Itoa(len(modifiedBody))
		bodyWriter.ResponseWriter.Header().Set("Content-Length", contentLength)

		// 使用ResponseWriter写入修改后的body
		_, err := bodyWriter.ResponseWriter.WriteString(modifiedBody)
		if err != nil {
			logrus.Fatalln(err)
		}

		bodyWriter.ResponseWriter.Flush()
	} else {
		_, _ = bodyWriter.ResponseWriter.Write(bodyWriter.body.Bytes())
	}
}
