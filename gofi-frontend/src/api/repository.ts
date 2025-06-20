import http from './http'
import { ConfigurationResult, UserResult } from './result'
import { AxiosProgressEvent } from 'axios'
import EnvUtil from '../utils/env.util'
import PathUtil from '../utils/path.util'

// 开发环境下,由于前端服务是vite启动的,需要指定后端服务地址
// 但是在生产环境下,默认是Go提供http服务,所以使用相对url作为api即可
const BASE_URL = EnvUtil.isDev ? 'http://localhost:8080/api/' : '/api/'

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
    fileType: string
    iconType: string
}

// 统一响应类型
export interface FileResponse {
    type: 'file' | 'directory'
    data: FileData | DirectoryData
}

export interface FileData {
    file: FileInfo
}

export interface DirectoryData {
    path: string
    files: FileInfo[]
}

/**
 * 获取gofi的设置项
 */
export async function fetchConfiguration(): Promise<ConfigurationResult> {
    return http.get('configuration')
}

/**
 * 更新gofi的设置项
 */
export async function updateConfiguration(config: ConfigurationParam): Promise<ConfigurationResult> {
    return http.post('configuration', config)
}

/**
 * 更新gofi的文件仓库路径
 */
export async function updateStoragePath(storagePath: string): Promise<ConfigurationResult> {
    return updateConfiguration({ customStoragePath: storagePath })
}

/**
 * setup 安装gofi,需要进行一些初始化设置
 */
export async function setup(config: ConfigurationParam): Promise<ConfigurationResult> {
    return http.post('setup', config)
}

/**
 * 登录
 */
export async function login(loginParam: LoginParam): Promise<string> {
    return http.post('user/login', loginParam)
}

/**
 * 请求用户信息
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
 * 统一的文件/目录获取接口
 * @param path 文件或目录路径
 * @returns Promise<FileResponse>
 */
export async function fetchFile(path: string): Promise<FileResponse> {
    console.log('[fetchFile] 原始路径:', path)
    
    // 先解码，再编码，确保网络传输时正确编码
    const decodedPath = PathUtil.decodePath(path)
    const encodedPath = PathUtil.encodePath(decodedPath)
    
    console.log('[fetchFile] 解码后路径:', decodedPath)
    console.log('[fetchFile] 编码后路径:', encodedPath)
    
    const url = `file?path=${encodedPath}`
    console.log('[fetchFile] 最终URL:', url)
    
    return http.get(url)
}

/**
 * 文件下载url
 */
export function getFileDownloadUrl(filePath: string) {
    const encodedPath = PathUtil.encodePath(filePath)
    return `${BASE_URL}download?path=${encodedPath}`
}

/**
 * 文件预览url
 */
export function getFilePreviewUrl(filePath: string) {
    const encodedPath = PathUtil.encodePath(filePath)
    return `${BASE_URL}download?path=${encodedPath}&raw=true`
}

/**
 * 上传文件
 */
export async function uploadFiles(
    dirPath: string,
    files: File[],
    onProgress: (fileName: string, progress: number) => void,
    overwrite: boolean = false
): Promise<void> {
    const formData = new FormData()

    files.forEach((file) => {
        formData.append(file.name, file)
    })

    // 先解码，再编码，确保网络传输时正确编码
    const decodedPath = PathUtil.decodePath(dirPath)
    const encodedPath = PathUtil.encodePath(decodedPath)
    
    const url = `upload?path=${encodedPath}${overwrite ? '&overwrite=true' : ''}`

    return http.post(url, formData, {
        onUploadProgress: (event: AxiosProgressEvent) => {
            // 只支持单文件时的进度
            if (files.length === 1) {
                onProgress(files[0].name, Math.round((event.loaded / (event.total || 1)) * 100))
            }
        },
    })
}

/**
 * 删除文件或文件夹
 */
export async function deleteFileOrFolder(path: string): Promise<void> {
    // 先解码，再编码，确保网络传输时正确编码
    const decodedPath = PathUtil.decodePath(path)
    const encodedPath = PathUtil.encodePath(decodedPath)
    
    return http.delete(`file?path=${encodedPath}`)
}

const repo = {
    fetchConfiguration,
    setup,
    login,
    fetchFile,
    getFileDownloadUrl,
    getFilePreviewUrl,
    fetchUser,
    changePassword,
    uploadFiles,
    updateStoragePath,
    deleteFileOrFolder,
}

export default repo
