import { LANGUAGE } from '../constants/storage'

export default class LangUtil {
    static getDefaultLang(): string {
        return sessionStorage.getItem(LANGUAGE) ?? navigator.language
    }
}
