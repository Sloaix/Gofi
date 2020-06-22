package middleware

import (
	"github.com/kataras/iris/v12"
	"github.com/sirupsen/logrus"
	"gofi/i18n"
	"golang.org/x/text/language"
)

var matcher = language.NewMatcher([]language.Tag{
	language.English, language.Chinese,
})

func LanguageHandler(ctx iris.Context) {
	// 浏览器的language
	browserLang := ctx.GetHeader("Accept-Language")
	// Gofi指定的language
	gofiLang := ctx.GetHeader("Accept-Language")
	tag, _ := language.MatchStrings(matcher, gofiLang, browserLang)

	logrus.Println("User language:", tag)
	i18n.SwitchLanguageByTag(tag)
	ctx.Next()
}
