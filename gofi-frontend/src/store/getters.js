const getters = {
  device: state => state.app.device,
  theme: state => state.app.theme,
  settings: state => state.app.settings,
  language: state => state.app.language,
  storagePath: state => {
    const { customStoragePath } = state.app.settings
    return customStoragePath
  },
  settingsValid: state => Object.entries(state.app.settings).length !== 0 // app info 是有效的，而不是空object
}

export default getters
