package test

import (
	"fmt"
	"gofi/i18n"
	"golang.org/x/text/language"
	"strings"
	"testing"
)

func TestLanguageTagParse(t *testing.T) {
	ChineseTag, _ := language.Parse("zh-CN")
	if ChineseTag.String() != "zh-CN" {
		t.Error("can't parse zh-CN")
	}

	EnglishTag, _ := language.Parse("en-US")
	if EnglishTag.String() != "en-US" {
		t.Error("can't parse en-US")
	}
}

func TestChineseTranslate(t *testing.T) {
	i18n.SwitchLanguage("zh-CN")
	for _, key := range i18n.TranslateKeys {
		template := i18n.ZhCN[key]

		if strings.Contains(template, "%s") {
			placeholder := "/Users/Sloaix/Desktop/gofi"
			expect := fmt.Sprintf(i18n.ZhCN[key], placeholder)
			actual := i18n.Translate(key, placeholder)
			if actual != expect {
				t.Errorf("\n expect: %s \n actual: %s", expect, actual)
			}
		} else {
			expect := fmt.Sprintf(i18n.ZhCN[key])
			actual := i18n.Translate(key)
			if actual != expect {
				t.Errorf("\n expect: %s \n actual: %s", expect, actual)
			}
		}

	}
}

func TestEnglishTranslate(t *testing.T) {
	i18n.SwitchLanguage("en-US")
	for _, key := range i18n.TranslateKeys {
		template := i18n.ZhCN[key]

		if strings.Contains(template, "%s") {
			placeholder := "/Users/Sloaix/Desktop/gofi"
			expect := fmt.Sprintf(i18n.EnUS[key], placeholder)
			actual := i18n.Translate(key, placeholder)
			if actual != expect {
				t.Errorf("\n expect: %s \n actual: %s", expect, actual)
			}
		} else {
			expect := fmt.Sprintf(i18n.EnUS[key])
			actual := i18n.Translate(key)
			if actual != expect {
				t.Errorf("\n expect: %s \n actual: %s", expect, actual)
			}
		}

	}
}

func TestKeyExist(t *testing.T) {
	for _, key := range i18n.TranslateKeys {
		_, ok := i18n.EnUS[key]
		if !ok {
			t.Errorf("key %s is not exist in EnUS", key)
		}

		_, ok = i18n.ZhCN[key]
		if !ok {
			t.Errorf("key %s is not exist in ZhCN", key)
		}
	}
}
