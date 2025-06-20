package test

import (
	"context"
	"testing"

	"gofi/i18n"

	"github.com/stretchr/testify/assert"
)

func TestTranslation(t *testing.T) {
	err := i18n.LoadTranslations()
	assert.NoError(t, err)

	t.Run("中文翻译", func(t *testing.T) {
		ctx := i18n.WithLang(context.Background(), "zh_Hans")
		assert.NotEmpty(t, i18n.T(ctx, "SuccessLoginSuccessful"))
		assert.NotEmpty(t, i18n.T(ctx, "ErrorFileNotExist"))
		assert.NotEmpty(t, i18n.T(ctx, "ErrorInvalidCredentials"))
		assert.NotEmpty(t, i18n.T(ctx, "SuccessUploadComplete"))
	})

	t.Run("英文翻译", func(t *testing.T) {
		ctx := i18n.WithLang(context.Background(), "en")
		assert.NotEmpty(t, i18n.T(ctx, "SuccessLoginSuccessful"))
		assert.NotEmpty(t, i18n.T(ctx, "ErrorFileNotExist"))
		assert.NotEmpty(t, i18n.T(ctx, "ErrorInvalidCredentials"))
		assert.NotEmpty(t, i18n.T(ctx, "SuccessUploadComplete"))
	})
}

func TestLanguageSwitch(t *testing.T) {
	err := i18n.LoadTranslations()
	assert.NoError(t, err)

	t.Run("语言切换", func(t *testing.T) {
		ctxCN := i18n.WithLang(context.Background(), "zh_Hans")
		chineseResult := i18n.T(ctxCN, "SuccessLoginSuccessful")
		assert.NotEmpty(t, chineseResult)

		ctxEN := i18n.WithLang(context.Background(), "en")
		englishResult := i18n.T(ctxEN, "SuccessLoginSuccessful")
		assert.NotEmpty(t, englishResult)

		assert.NotEqual(t, chineseResult, englishResult)
	})
}

func TestTranslationWithParameters(t *testing.T) {
	err := i18n.LoadTranslations()
	assert.NoError(t, err)

	t.Run("带参数翻译", func(t *testing.T) {
		ctx := i18n.WithLang(context.Background(), "zh_Hans")
		result := i18n.T(ctx, "ErrorFileNotExist", "test.txt")
		assert.NotEmpty(t, result)
	})
}

func TestConcurrentTranslation(t *testing.T) {
	err := i18n.LoadTranslations()
	assert.NoError(t, err)

	t.Run("并发翻译", func(t *testing.T) {
		ctx := i18n.WithLang(context.Background(), "zh_Hans")
		done := make(chan bool, 10)
		for i := 0; i < 10; i++ {
			go func() {
				result := i18n.T(ctx, "SuccessLoginSuccessful")
				assert.NotEmpty(t, result)
				done <- true
			}()
		}
		for range 10 {
			<-done
		}
	})
}
