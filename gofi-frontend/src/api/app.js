import { axios } from '@/utils/request'

const api = {
  Configuration: 'configuration',
  Setup: 'setup'
}

export default api

/**
 * 获取gofi的设置项
 * @returns {AxiosPromise}
 */
export function getConfiguration () {
  return axios.get(api.Configuration)
}

/**
 * 更新gofi的设置项
 * @returns {AxiosPromise}
 */
export function updateConfiguration (configuration) {
  return axios.post(api.Configuration, configuration)
}

/**
 * 更新gofi的文件仓库路径
 * @returns {AxiosPromise}
 */
export function updateStoragePath (storagePath) {
  return updateConfiguration({ customStoragePath: storagePath })
}

/**
 * setup 安装gofi,需要进行一些初始化设置
 * @param configuration
 * @returns {Promise<AxiosResponse<T>>}
 */
export function setup (configuration) {
  return axios.post(api.Setup, configuration)
}
