export default interface RepsonseWrapper<T> {
    success: boolean
    message: string
    code: number
    data: T
}

interface ConfigurationResult {
    defaultLanguage: string // 默认语言
    customStoragePath: string // 自定义文件仓库路径
    defaultStoragePath: string // 默认文件仓库路径
    appPath: string // 应用程序所在目录路径
    initialized: boolean // 是否初始化
    version: string // 应用版本
    created: string // 创建时间
    updated: string // 更新时间
}

interface UserResult {
    id: number // id
    roleType: number // 用户类型
    username: string // 用户名
}

export type { ConfigurationResult, UserResult }
