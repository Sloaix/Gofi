export default {
  notice: {
    switchLanguage: 'Switching language...'
  },
  setup: {
    step1: {
      name: 'Setup'
    },
    step2: {
      name: 'Complete',
      title: 'Gofi setup complete',
      description: 'after {0} seconds, will be redirect to home page ,you can view the following information on Settings page.',
      fileStoragePath: 'File storage path',
      logDirectoryPath: 'Log Directory Path',
      sqlite3DbFilePath: 'Database file path',
      defaultLanguage: 'Default language'
    }
  },
  menu: {
    index: 'Home',
    allFile: 'File',
    setting: 'Setting'
  },
  footer: {
    aboutMe: 'About me',
    copyRight: 'Copyright © 2019 Sloaix',
    version: 'Version'
  },
  allFile: {
    rootDir: 'Root Directory',
    parentDir: 'Parent Directory',
    upload: 'Upload',
    name: 'Name',
    size: 'Size',
    action: 'Action',
    lastModified: 'Last Modified',
    download: 'Download'
  },
  upload: {
    failed: 'upload failed',
    success: 'upload success',
    fileUploading: '{0} uploading...',
    uploadFailed: '{0} upload failed',
    uploadSuccess: '{0} upload success'
  },
  fallback: {
    saveSuccess: 'save success',
    saveFailed: 'save failed',
    submitSuccess: 'submit success',
    submitFailed: 'submit failed',
    error: 'error',
    installFailed: 'install failed'
  },
  setting: {
    baseSetting: 'Base',
    customSetting: 'Custom'
  },
  form: {
    button: {
      home: {
        name: 'Home'
      },
      save: {
        name: 'Save'
      },
      submit: {
        name: 'Submit'
      }
    },
    select: {
      fileStorageType: {
        def: 'default',
        custom: 'custom'
      },
      language: {
        name: 'Language',
        errorMessage: 'please choose language'
      }
    },
    input: {
      fileStoragePath: {
        name: 'File Storage Path',
        placeholder: 'input absolute directory path',
        errorMessage: 'directory path is must'
      },
      navMode: {
        name: 'Navigation Mode',
        top: 'Top Menu',
        side: 'Side Menu'
      },
      themeStyle: {
        name: 'Theme Style',
        light: 'Light',
        dark: 'Dark'
      }
    }
  }
}
