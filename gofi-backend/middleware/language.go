package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gofi/i18n"
	"golang.org/x/text/language"
)

var matcher = language.NewMatcher([]language.Tag{
	language.English, language.Chinese,
})

func Language(c *gin.Context) {
	// 浏览器的language
	browserLang := c.GetHeader("Accept-Language")
	// Gofi指定的language
	gofiLang := c.GetHeader("Accept-Language")
	tag, _ := language.MatchStrings(matcher, gofiLang, browserLang)

	logrus.Println("User language:", tag)
	i18n.SwitchLanguageByTag(tag)
	c.Next()
}
