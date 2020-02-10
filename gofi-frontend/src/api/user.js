import { axios } from '@/utils/request'

const api = {
  User: 'user',
  Login: 'user/login',
  ChangePassword: 'user/changePassword'
}

export default api

/**
 * user func
 * parameter: {
 *     username: '',
 *     password: '',
 * }
 * @param username
 * @param password
 * @returns {*}
 */
export function login (username, password) {
  return axios.post(api.Login, {
    'username': username,
    'password': password
  })
}

/**
 * changePassword func
 * parameter: {
 *     password: '',
 *     confirm: '',
 * }
 * @param password
 * @param confirm
 * @returns {*}
 */
export function changePassword (password, confirm) {
  return axios.post(api.ChangePassword, {
    'password': password,
    'confirm': confirm
  })
}

export function logout () {
  return axios({
    url: '/auth/logout',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function getUser () {
  return axios.get(api.User)
}
