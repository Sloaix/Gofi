import _ from 'lodash'
import { atom } from 'recoil'
import { LANGUAGE, TOKEN } from '../constants/storage'
import i18n from '../i18n'
import LanguageUtil from '../utils/language.util'

export const tokenState = atom<string | null>({
    key: 'token',
    default: sessionStorage.getItem(TOKEN),
})

export const languageState = atom<string>({
    key: 'language',
    default: (() => {
        const language = localStorage.getItem(LANGUAGE) ?? LanguageUtil.getBrowserLanguage()

        if (_.isEmpty(localStorage.getItem(LANGUAGE))) {
            localStorage.setItem(LANGUAGE, language)
        }

        i18n.changeLanguage(language)
        return language
    })(),
    effects_UNSTABLE: [
        ({ onSet }) => {
            onSet((language) => {
                i18n.changeLanguage(language)
                localStorage.setItem(LANGUAGE, language)
            })
        },
    ],
})
