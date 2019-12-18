import axios from 'axios'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import Vue from 'vue'
import { DEFAULT_LANGUAGE } from '@/store/mutation-types'
import config from '@/config/defaultSettings'

// 创建 axios 实例
const service = axios.create({
  baseURL: window.GOFI_MANIFEST.VUE_APP_API_BASE_URL, // api base_url
  timeout: 6000 // 请求超时时间
})

const err = (error) => {
  if (error.response) {
    const data = error.response.data
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 &&
      !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
    }
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(request => {
  const language = Vue.ls.get(DEFAULT_LANGUAGE, config.language)
  if (language) {
    request.headers['Accept-Language'] = language // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  return request
}, err)

// response interceptor
service.interceptors.response.use((response) => {
  if (response.data) {
    if (response.data.success) {
      return response.data.data
    } else {
      throw response.data.message
    }
  }
  return response
}, err)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}
