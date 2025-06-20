import { atom } from 'jotai'
import { LANGUAGE, TOKEN, THEME } from '../constants/storage'
import i18n from '../i18n'
import LanguageUtil from '../utils/language.util'

export const tokenState = atom<string | null>(sessionStorage.getItem(TOKEN))

// 创建基础的语言状态 atom
const baseLanguageState = atom<string>(
    (() => {
        const language = localStorage.getItem(LANGUAGE) ?? LanguageUtil.getBrowserLanguage()

        if (!localStorage.getItem(LANGUAGE)) {
            localStorage.setItem(LANGUAGE, language)
        }

        i18n.changeLanguage(language)
        return language
    })()
)

// 创建可写的语言状态 atom
export const languageState = atom(
    (get) => get(baseLanguageState),
    (get, set, newLanguage: string) => {
        set(baseLanguageState, newLanguage)
        localStorage.setItem(LANGUAGE, newLanguage)
        i18n.changeLanguage(newLanguage)
    }
)

export type ThemeMode = 'light' | 'dark' | 'system'

export const themeState = atom<ThemeMode>(
    (() => {
        const theme = (localStorage.getItem(THEME) as ThemeMode) ?? 'system'
        
        if (!localStorage.getItem(THEME)) {
            localStorage.setItem(THEME, theme)
        }

        return theme
    })()
)
