import { action, makeObservable, observable } from 'mobx'
import { delay, of } from 'rxjs'
import repo from '../api/repository'
import { ConfigurationResult } from '../api/result'
import { LANGUAGE } from '../constants/storage'
import i18n from '../i18n'
import LangUtil from '../utils/lang.util'
const APP_CONFIG = 'APP_CONFIG'
class AppStore {
    config: ConfigurationResult | undefined = undefined
    lang = LangUtil.getDefaultLang()

    constructor() {
        makeObservable(this, {
            config: observable,
            fetchConfig: action,
            setup: action,
            setConfig: action,
            changeLanguage: action,
        })
        this.changeLanguage(this.lang)

        // 首次进入就开始请求config
        // 延迟1000ms让loading动画有时间显示
        this.fetchConfig(1000, true)
    }

    /**
     * 改变当前语言
     */
    changeLanguage(lang: string) {
        i18n.changeLanguage(lang)
        sessionStorage.setItem(LANGUAGE, lang)
        this.lang = lang
    }

    /**
     * 根据给定的仓库路径初始化Gofi
     * @param storagePath 仓库路径
     * @returns Promise<ConfigurationResult>
     */
    async setup(storagePath: string): Promise<ConfigurationResult> {
        return await repo.setup({ customStoragePath: storagePath })
    }

    /**
     * 获取最新的config
     * @param delay 延迟,单位毫秒
     */
    async fetchConfig(delayTime: number = 0, force: boolean = false) {
        if (!force) {
            const localConfigString = sessionStorage.getItem(APP_CONFIG)

            // check cache from local session
            if (localConfigString) {
                const localConfig = JSON.parse(localConfigString) as ConfigurationResult

                if (localConfig) {
                    this.setConfig(localConfig)
                    return
                }
            }
        }

        try {
            const result = await repo.fetchConfiguration()
            of(result)
                .pipe(delay(delayTime))
                .subscribe((result) => {
                    this.setConfig(result)
                    sessionStorage.setItem(APP_CONFIG, JSON.stringify(result))
                })
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * 更新文件仓库地址
     * @param path new storage path
     * @returns true, if update success
     */
    async updateStoragePath(path: string): Promise<boolean> {
        try {
            const config = await repo.updateStoragePath(path)
            this.setConfig(config)
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    setConfig(config: ConfigurationResult) {
        this.config = config
    }

    get defaultStoragePath(): string | undefined {
        return this.config?.defaultStoragePath
    }
}
export default AppStore
