import { changePassword, getUser, login } from '@/api/user'
import Vue from 'vue'
import { TOKEN } from '@/store/mutation-types'

const user = {
  state: {
    userInfo: null,
    token: ''
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      // 将token存储到storage,更改登录状态
      state.token = token
      Vue.ls.set(TOKEN, token)
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
    }
  },
  actions: {
    Login ({ commit }, { username, password }) {
      return new Promise((resolve, reject) => {
        console.log(`login action, username is ${username},password is ${password}`)
        login(username, password).then(token => {
          commit('SET_TOKEN', token)
          resolve(token)
        }).catch(error => {
          reject(error)
        })
      })
    },
    Logout ({ commit }) {
      return new Promise((resolve, reject) => {
        commit('SET_TOKEN', '')
        commit('SET_USER_INFO', null)
        resolve()
      })
    },
    ChangePassword ({ commit }, { password, confirm }) {
      return new Promise((resolve, reject) => {
        changePassword(password, confirm).then(response => {
          console.log('changePassword action')
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    GetUser ({ commit }) {
      return new Promise((resolve, reject) => {
        getUser().then(userInfo => {
          console.log('getUser action')
          commit('SET_USER_INFO', userInfo)
          resolve(userInfo)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user
