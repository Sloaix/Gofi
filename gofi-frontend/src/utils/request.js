import axios from 'axios'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import Vue from 'vue'
import { DEFAULT_LANGUAGE, TOKEN } from '@/store/mutation-types'
import config from '@/config/defaultSettings'
import i18n from '@/locales'
import store from '@/store/index'

// 创建 axios 实例
const service = axios.create({
  baseURL: window.GOFI_MANIFEST.VUE_APP_API_BASE_URL, // api base_url
  timeout: 6000 // 请求超时时间
})

const err = (error) => {
  console.log(error)
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
  } else {
    error = i18n.t('network.error')
  }
  return Promise.reject(error)
}

// request interceptor for language
service.interceptors.request.use(request => {
  const language = Vue.ls.get(DEFAULT_LANGUAGE, config.language)
  console.log('http-interceptor:header language is ' + language)
  if (language) {
    request.headers['Accept-Language'] = language
  }
  return request
}, err)

// request interceptor for token
service.interceptors.request.use(request => {
  console.log('token is ' + store.state.user.token)
  const token = Vue.ls.get(TOKEN, null)
  if (token) {
    request.headers['Authorization'] = `bearer ${token}` // 让每个请求携带自定义 token
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
