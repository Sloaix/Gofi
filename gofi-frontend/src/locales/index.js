/**
 * Vue i18n loader
 * created by @musnow
 * https://github.com/musnow
 */
import Vue from 'vue'
import VueI18n from 'vue-i18n'
// default language
import enUS from './lang/en-US'
import zhCN from './lang/zh-CN'
// change default accept-language
import { axios } from '@/utils/request'
import zhCnVue from 'ant-design-vue/lib/locale-provider/zh_CN'
import zhUsVue from 'ant-design-vue/lib/locale-provider/en_US'

export var ANT_DESIGN_VUE_LOCALE_MAPS = {
  'zh-CN': zhCnVue,
  'en-US': zhUsVue
}

Vue.use(VueI18n)

export const defaultLang = 'zh-CN'
// export const defaultLang = 'en-US'

const messages = {
  'zh-CN': {
    ...zhCN
  },
  'en-US': {
    ...enUS
  }
}

const i18n = new VueI18n({
  locale: defaultLang,
  fallbackLocale: defaultLang,
  messages
})

export default i18n

const loadedLanguages = [defaultLang]

// 从缓存設置中加载当前语言
// if (Vue.ls.get('lang') !== null && defaultLang !== Vue.ls.get('lang')) {
//   loadLanguageAsync(localStorage.lang)
// }

function setI18nLanguage (lang) {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

export function loadLanguageAsync (lang = defaultLang) {
  return new Promise(resolve => {
    // 缓存语言设置
    Vue.ls.set('lang', lang)
    if (i18n.locale !== lang) {
      if (!loadedLanguages.includes(lang)) {
        return import(/* webpackChunkName: "lang-[request]" */ `./lang/${lang}`).then(
          msg => {
            i18n.setLocaleMessage(lang, msg.default)
            loadedLanguages.push(lang)
            return setI18nLanguage(lang)
          })
      }
      return resolve(setI18nLanguage(lang))
    }
    return resolve(lang)
  })
}
