import { LANGUAGE } from '../constants/storage'

export default class LangUtil {
    static getDefaultLang(): string {
        // navigator.language可能返回的是zh-CN，去除后缀
        let navigatorLang = `${navigator.language}`.toLocaleLowerCase().startsWith('zh') ? 'zh' : 'en'
        return localStorage.getItem(LANGUAGE) ?? navigatorLang
    }
}
