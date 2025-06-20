import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import zhHans from './zh-Hans'
// import zhHant from './zh-Hant'
// import ja from './ja'
// import fr from './fr'
import LanguageUtil from '../utils/language.util'
import { LANGUAGE } from '../constants/storage'

const resources = {
    en: {
        translation: en,
    },
    'zh-Hans': {
        translation: zhHans,
    },
    // alias for zh-Hans
    'zh-CN': {
        translation: zhHans,
    },
    // alias for zh-Hans
    'zh-SG': {
        translation: zhHans,
    },
    // 'zh-Hant': {
    //     translation: zhHant,
    // },
    // // alias for zh-Hant
    // 'zh-TW': {
    //     translation: zhHant,
    // },
    // // alias for zh-Hant
    // 'zh-HK': {
    //     translation: zhHant,
    // },
    // ja: {
    //     translation: ja,
    // },
    // fr: {
    //     translation: fr,
    // },
}

// 获取默认语言
const getDefaultLanguage = () => {
    const savedLanguage = localStorage.getItem(LANGUAGE)
    if (savedLanguage) {
        return savedLanguage
    }
    return LanguageUtil.getBrowserLanguage()
}

i18n.use(initReactI18next).init({
    resources: resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
})

export default i18n
