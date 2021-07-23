import axios from 'axios'
import { LANGUAGE, TOKEN } from '../constants/storage'
import Toast from '../utils/toast.util'
import RepsonseWrapper from './result'

declare global {
    interface Window {
        GOFI_MANIFEST: {
            API_BASE_URL: string
        }
    }
}

// 创建axios实例
const http = axios.create({
    baseURL: window.GOFI_MANIFEST.API_BASE_URL, // api的base_url
    headers: {
        'content-type': 'application/json',
    },
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
    if (language) {
        request.headers['Accept-Language'] = language
    }
    return request
}, err)

// attach token to header
http.interceptors.request.use((request) => {
    const token = localStorage.getItem(TOKEN)
    if (token) {
        request.headers['Authorization'] = `bearer ${token}` // 让每个请求携带自定义 token
    }
    return request
}, err)

http.interceptors.response.use(
    (response) => {
        const responseWrapper: RepsonseWrapper<any> = response.data

        if (!responseWrapper || responseWrapper.code != 200) {
            Toast.e(`${responseWrapper.message}`)
            return Promise.reject(new Error(`status is ${responseWrapper.code}`))
        }

        return responseWrapper.data
    },
    function (error) {
        // 任何超出2xx范围的状态代码都会触发此函数
        // 处理响应错误
        Toast.e(`${error}`)
        return Promise.reject(error)
    },
)

export default http
