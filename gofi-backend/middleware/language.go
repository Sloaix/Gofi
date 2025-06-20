package middleware

import (
	"gofi/i18n"
	"gofi/tool"

	"github.com/gin-gonic/gin"
	"golang.org/x/text/language"
)

var matcher = language.NewMatcher([]language.Tag{
	language.English, language.SimplifiedChinese, language.TraditionalChinese, language.Japanese, language.French,
})

func Language(c *gin.Context) {
	// 浏览器的language
	acceptLanguageFromClient := c.GetHeader("Accept-Language")
	tag, _ := language.MatchStrings(matcher, acceptLanguageFromClient)

	tool.GetLogger().Infof("[LANG] Accept-Language: %s, matched tag: %s", acceptLanguageFromClient, tag)
	tool.GetLogger().Infof("[LANG] Set context lang: %s", tag.String())
	c.Request = c.Request.WithContext(i18n.WithLang(c.Request.Context(), tag.String()))
	c.Next()
}
