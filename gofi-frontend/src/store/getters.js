const getters = {
  device: state => state.app.device,
  theme: state => state.app.theme,
  configuration: state => state.app.configuration,
  acceptLanguage: state => state.app.acceptLanguage,
  language: state => state.app.language,
  storagePath: state => {
    const { customStoragePath, defaultStoragePath } = state.app.configuration
    return customStoragePath || defaultStoragePath
  },
  configurationValid: state => Object.entries(state.app.configuration).length !== 0 // app info 是有效的，而不是空object
}

export default getters
