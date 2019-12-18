import { axios } from '@/utils/request'

const api = {
  Setting: 'setting',
  Setup: 'setup'
}

export default api

/**
 * 获取gofi的设置项
 * @returns {AxiosPromise}
 */
export function getSetting () {
  return axios.get(api.Setting)
}

/**
 * 更新gofi的设置项
 * @returns {AxiosPromise}
 */
export function updateSetting (settings) {
  return axios.post(api.Setting, settings)
}

/**
 * 更新gofi的文件仓库路径
 * @returns {AxiosPromise}
 */
export function updateStoragePath (storagePath) {
  return updateSetting({ customStoragePath: storagePath })
}

/**
 * setup 安装gofi,需要进行一些初始化设置
 * @param settings
 * @returns {Promise<AxiosResponse<T>>}
 */
export function setup (settings) {
  return axios.post(api.Setup, settings)
}
