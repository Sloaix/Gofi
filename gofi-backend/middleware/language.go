package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gofi/i18n"
	"golang.org/x/text/language"
)

var matcher = language.NewMatcher([]language.Tag{
	language.English, language.SimplifiedChinese, language.TraditionalChinese, language.Japanese, language.French,
})

func Language(c *gin.Context) {
	// 浏览器的language
	acceptLanguageFromClient := c.GetHeader("Accept-Language")
	tag, _ := language.MatchStrings(matcher, acceptLanguageFromClient)

	logrus.Infof("acceptLanguageFromClient: %s", acceptLanguageFromClient)
	logrus.Infof("language tag is : %s", tag)
	i18n.SwitchLanguageByTag(tag)
	c.Next()
}
