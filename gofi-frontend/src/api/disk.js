import { axios } from '@/utils/request'

const api = {
  ListFiles: 'files',
  Download: 'download',
  Upload: 'upload'
}

export default api

/**
 *
 * @param directoryPath 文件夹路径
 * @returns {AxiosPromise}
 */
export function getFileList (directoryPath) {
  return axios.get(api.ListFiles, {
    params: {
      path: directoryPath
    }
  })
}

/**
 *
 * @param directoryPath 文件夹路径
 * @param files
 * @returns {AxiosPromise}
 */
export function uploadFiles (directoryPath, files) {
  const formData = new FormData()
  formData.append('files', files)
  return axios.post(api.Upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params: {
      path: directoryPath
    }
  })
}
