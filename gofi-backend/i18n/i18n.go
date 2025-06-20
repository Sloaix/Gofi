package i18n

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
)

//go:embed en.json zh_Hans.json
var i18nFS embed.FS

type ctxKey struct{}

var (
	translations = map[string]map[string]string{} // lang -> key -> value
	defaultLang  = "zh-Hans"
	mu           sync.RWMutex
)

// 加载所有语言包
func LoadTranslations() error {
	langs := []string{"zh_Hans", "en"}
	for _, lang := range langs {
		filename := lang + ".json"
		log.Printf("[i18n] loading lang=%s file=%s", lang, filename)
		data, err := i18nFS.ReadFile(filename)
		if err != nil {
			log.Printf("[i18n] failed to read %s: %v", filename, err)
			return err
		}
		m := map[string]string{}
		if err := json.Unmarshal(data, &m); err != nil {
			log.Printf("[i18n] failed to unmarshal %s: %v", filename, err)
			return err
		}
		log.Printf("[i18n] loaded %d keys for lang=%s", len(m), lang)
		for k := range m {
			log.Printf("[i18n] lang=%s key=%s", lang, k)
		}
		translations[lang] = m
	}
	return nil
}

// 设置当前请求的语言
func WithLang(ctx context.Context, lang string) context.Context {
	return context.WithValue(ctx, ctxKey{}, lang)
}

// 获取当前请求的语言
func getLang(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKey{}).(string); ok && v != "" {
		return strings.ReplaceAll(v, "-", "_")
	}
	return defaultLang
}

// 翻译
func T(ctx context.Context, key string, args ...interface{}) string {
	lang := getLang(ctx)
	mu.RLock()
	defer mu.RUnlock()
	var result string
	if m, ok := translations[lang]; ok {
		if val, ok := m[key]; ok {
			result = fmt.Sprintf(val, args...)
			log.Printf("[i18n] lang=%s key=%s result=%s", lang, key, result)
			return result
		}
	}
	// fallback
	if m, ok := translations[defaultLang]; ok {
		if val, ok := m[key]; ok {
			result = fmt.Sprintf(val, args...)
			log.Printf("[i18n] lang=%s (fallback) key=%s result=%s", lang, key, result)
			return result
		}
	}
	// key不存在
	log.Printf("[i18n] lang=%s key=%s result=KEY_NOT_FOUND", lang, key)
	return key
}
