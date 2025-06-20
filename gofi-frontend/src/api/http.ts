import axios from 'axios'
import { LANGUAGE, TOKEN } from '../constants/storage'
import EnvUtil from '../utils/env.util'
import Toast from '../utils/toast.util'
import RepsonseWrapper from './result'
import i18n from '../i18n'

// 开发环境下,由于前端服务是vite启动的,需要指定后端服务地址
// 但是在生产环境下,默认是Go提供http服务,所以使用相对url作为api即可
const BASE_URL = EnvUtil.isDev ? 'http://localhost:8080/api/' : '/api/'

// 创建axios实例
const http = axios.create({
    baseURL: BASE_URL, // api的base_url
    timeout: 10000, // 10秒超时
})

const err = (error: { response: { data: any; status: number } }) => {
    console.log(error)
    if (error.response) {
        const data = error.response.data
        if (error.response.status === 403) {
            Toast.e(data.message)
        }
        if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
            Toast.e('Authorization verification failed')
        }
    } else {
        // error = i18n.t('network.error')
    }
    return Promise.reject(error)
}

// request interceptor for language
http.interceptors.request.use((request) => {
    const language = localStorage.getItem(LANGUAGE)
    if (language && request.headers) {
        request.headers['Accept-Language'] = language
    }
    return request
}, err)

// attach token to header
http.interceptors.request.use((request) => {
    const token = sessionStorage.getItem(TOKEN)
    if (token && request.headers) {
        request.headers['Authorization'] = `bearer ${token}` // 让每个请求携带自定义 token
    }
    
    // 为JSON请求设置Content-Type，但保持FormData的自动设置
    if (request.data && typeof request.data === 'object' && !(request.data instanceof FormData)) {
        request.headers['Content-Type'] = 'application/json'
    }
    
    return request
}, err)

http.interceptors.response.use(
    (response) => {
        const responseWrapper: RepsonseWrapper<any> = response.data

        if (!responseWrapper || responseWrapper.code != 200) {
            // 显示友好的错误消息
            const errorMessage = responseWrapper?.message || '请求失败'
            Toast.e(errorMessage)
            // 抛出包含响应码的错误对象
            const error = new Error(errorMessage) as any
            error.code = responseWrapper?.code
            error.response = { status: responseWrapper?.code }
            return Promise.reject(error)
        }

        return responseWrapper.data
    },
    function (error) {
        // 网络错误处理
        if (isNetworkError(error)) {
            const { message, detail } = getNetworkErrorInfo(error)
            Toast.networkError(message, detail)
        } else if (error.response) {
            // 服务器响应错误
            const status = error.response.status
            if (status >= 500) {
                Toast.serverError(i18n.t('toast.server-error'), i18n.t('toast.server-error-detail'))
            } else {
                // 尝试从响应中获取友好的错误消息
                const errorMessage = error.response.data?.message || error.message
                Toast.e(errorMessage)
            }
        } else {
            // 其他错误
            Toast.e(error.message)
        }
        
        return Promise.reject(error)
    },
)

// 判断是否为网络错误
const isNetworkError = (err: any) => {
    return !!err.isAxiosError && !err.response
}

// 获取网络错误信息
const getNetworkErrorInfo = (error: any) => {
    const { t } = i18n
    
    if (error.code === 'ECONNABORTED') {
        return {
            message: t('toast.timeout-error'),
            detail: t('toast.timeout-error-detail')
        }
    }
    
    if (error.code === 'ERR_NETWORK') {
        return {
            message: t('toast.network-error'),
            detail: t('toast.network-error-detail')
        }
    }
    
    if (error.code === 'ECONNREFUSED') {
        return {
            message: t('toast.connection-refused'),
            detail: t('toast.connection-refused-detail')
        }
    }
    
    // 默认网络错误
    return {
        message: t('toast.network-error'),
        detail: t('toast.network-error-detail')
    }
}

export default http
