import { LANGUAGE } from '../constants/storage'

export default class LangUtil {
    static getDefaultLang(): string {
        return localStorage.getItem(LANGUAGE) ?? navigator.language
    }
}
