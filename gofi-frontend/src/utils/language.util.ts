export default class LanguageUtil {
    // 简体中文
    public static SIMPLIFIED_CHINESE = ['zh-Hans', 'zh-CN', 'zh-SG', 'zh-MY']
    // 繁体中文
    public static TRADITIONAL_CHINESE = ['zh-Hant', 'zh-TW', 'zh-HK', 'zh-MO']

    public static simplify(language: string) {
        if (LanguageUtil.SIMPLIFIED_CHINESE.includes(language)) {
            return 'zh-Hans'
        } else if (LanguageUtil.TRADITIONAL_CHINESE.includes(language)) {
            return 'zh-Hant'
        } else {
            return language
        }
    }

    // 获取浏览器的首选语言
    public static getBrowserLanguage() {
        return LanguageUtil.simplify(navigator.language)
    }
}
