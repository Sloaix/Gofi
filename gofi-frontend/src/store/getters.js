import i18n from '@/locales'

const getters = {
  device: state => state.app.device,
  theme: state => state.app.theme,
  isLogin: state => !!state.user.token,
  username: state => state.user.userInfo != null ? state.user.userInfo.username : '',
  isAdmin: state => state.user.userInfo != null && state.user.userInfo.roleType === 0,
  userType: state => state.user.userInfo != null && state.user.userInfo.roleType === 0 ? i18n.t('description.admin') : i18n.t('description.normalUser'),
  configuration: state => state.app.configuration,
  initialized: state => state.app.configuration ? state.app.configuration.initialized : false,
  headers: state => {
    let headers = { 'Accept-Language': state.app.language }
    if (state.user && state.user.token) {
      headers = Object.assign(headers, { Authorization: `bearer ${state.user.token}` })
    }
    return headers
  },
  language: state => state.app.language,
  storagePath: state => {
    const { customStoragePath, defaultStoragePath } = state.app.configuration
    return customStoragePath || defaultStoragePath
  },
  configurationValid: state => Object.entries(state.app.configuration).length !== 0 // app info 是有效的，而不是空object
}

export default getters
