import http, { BASE_URL } from './http'
import { ConfigurationResult, UserResult } from './result'

export interface ConfigurationParam {
    customStoragePath: string
}

export interface LoginParam {
    username: string
    password: string
}

export interface ChangePasswordParam {
    password: string
    confirm: string
}

export interface FileInfo {
    name: string
    isDirectory: boolean
    size: number
    extension: string
    mime: string
    path: string
    lastModified: number
    content: string
}

/**
 * 获取gofi的设置项
 * @returns {AxiosPromise}
 */
export async function fetchConfiguration(): Promise<ConfigurationResult> {
    return http.get('configuration')
}

/**
 * 更新gofi的设置项
 * @returns {AxiosPromise}
 */
export async function updateConfiguration(config: ConfigurationParam): Promise<ConfigurationResult> {
    return http.post('configuration', config)
}

/**
 * 更新gofi的文件仓库路径
 * @returns {AxiosPromise}
 */
export async function updateStoragePath(storagePath: string): Promise<ConfigurationResult> {
    return updateConfiguration({ customStoragePath: storagePath })
}

/**
 * setup 安装gofi,需要进行一些初始化设置
 * @param configuration
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function setup(config: ConfigurationParam): Promise<ConfigurationResult> {
    return http.post('setup', config)
}

/**
 * 登录
 * @param loginParam LoginParam
 * @returns token
 */
export async function login(loginParam: LoginParam): Promise<string> {
    return http.post('user/login', loginParam)
}

/**
 * 请求用户信息
 * @returns
 */
export async function fetchUser(): Promise<UserResult> {
    return http.get('user')
}

/**
 * 修改密码
 */
export async function changePassword(param: ChangePasswordParam): Promise<void> {
    return http.post('user/changePassword', param)
}

/**
 * 文件列表
 * @param dirPath 文件夹路径
 * @returns Observable<FileType[]>
 */
export async function fetchFileList(dirPath: string): Promise<Array<FileInfo>> {
    return http.get('files', { params: { path: dirPath } })
}

/**
 * 返回FileDetail的详细信息
 * @param filePath
 * @returns
 */
export async function fetchFileDetail(filePath: string): Promise<FileInfo> {
    return http.get('file', { params: { path: filePath } })
}

/**
 * 文件下载url
 * @param filePath
 * @returns
 */
export function getFileDownloadUrl(filePath: string) {
    return `${BASE_URL}download?path=${encodeURIComponent(filePath)}`
}

export function getFilePreviewUrl(filePath: string) {
    return `${BASE_URL}download?path=${encodeURIComponent(filePath)}&raw=true`
}

/**
 * 上传文件
 * @dirPath string 目标文件夹路径
 * @param file File
 */
export async function uploadFiles(
    dirPath: string,
    files: File[],
    onProgress: (progress: number, total: number) => void,
): Promise<void> {
    const formData = new FormData()

    files.forEach((file) => {
        formData.append(file.name, file)
    })

    return http.post('upload', formData, {
        params: { path: dirPath },
        onUploadProgress: (event: ProgressEvent) => {
            onProgress(event.loaded, event.total)
        },
    })
}

const repo = {
    fetchConfiguration,
    setup,
    login,
    fetchFileList,
    fetchFileDetail,
    getFileDownloadUrl,
    getFilePreviewUrl,
    fetchUser,
    changePassword,
    uploadFiles,
    updateStoragePath,
}

export default repo
