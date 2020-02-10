package i18n

import (
	"github.com/sirupsen/logrus"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"strconv"
)

var printer *message.Printer
var currentTag = language.English

type MessageKey int

const (
	IsNotDir MessageKey = iota
	IsNotFile
	IsNotTextFile
	DirIsNotExist
	FileIsNotExist
	GofiIsAlreadyInitialized
	UploadFailed
	CanNotOverlayExistFile
	CurrentIsPreviewMode
	OperationNotAllowedInPreviewMode
	NotAuthorized
	UsernameOrPasswordIsWrong
)

var TranslateKeys = []MessageKey{
	IsNotDir,
	IsNotFile,
	IsNotTextFile,
	DirIsNotExist,
	FileIsNotExist,
	GofiIsAlreadyInitialized,
	UploadFailed,
	CanNotOverlayExistFile,
	CurrentIsPreviewMode,
	OperationNotAllowedInPreviewMode,
	NotAuthorized,
	UsernameOrPasswordIsWrong,
}

func (messageKey MessageKey) String() string {
	return strconv.Itoa(int(messageKey))
}

func init() {
	for _, key := range TranslateKeys {
		_ = message.SetString(language.Chinese, key.String(), ZhCN[key])
		_ = message.SetString(language.English, key.String(), EnUS[key])
	}
	printer = message.NewPrinter(language.Chinese)
}

func SwitchLanguageByTag(tag language.Tag) {
	if currentTag.String() == tag.String() {
		return
	}

	printer = message.NewPrinter(tag)
	currentTag = tag
}

func SwitchLanguage(lang string) {
	tag, err := language.Parse(lang)
	if err != nil {
		logrus.Errorf("switch language failed, %s can't be parsed", lang)
	} else {
		logrus.Infof("switch language to %s", lang)
	}
	printer = message.NewPrinter(tag)
}

func Translate(key MessageKey, values ...interface{}) string {
	return printer.Sprintf(key.String(), values...)
}
