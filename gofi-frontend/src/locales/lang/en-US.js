export default {
  title: {
    userType: 'User type',
    username: 'Username',
    password: 'Password',
    changePassword: 'Change password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password'
  },
  description: {
    admin: 'Admin',
    hasBeenSet: 'Has been set',
    ChangePasswordSoonTip: 'To ensure the security of your account, please change your password as soon as possible after your first login.',
    placeHolderForNewPassword: 'Input new password',
    placeHolderForConfirmPassword: 'Input new password again',
    confirmPasswordError: 'Confirm password error',
    changeSuccess: 'Change succeeded.',
    usernameOrPasswordWrong: 'Username or password is wrong',
    forgetPassword: 'Forget password?',
    contactAdmin: 'Please contact admin'
  },
  action: {
    edit: 'Edit',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    modify: 'Modify',
    confirm: 'Confirm',
    login: 'Login',
    logout: 'Logout'
  },
  auth: {
    requireAuth: {
      content: 'Please login first'
    },
    logoutConfirm: {
      title: 'Warning',
      content: 'Really to logout ?'
    },
    loginSuccess: {
      title: 'Welcome',
      content: 'welcome back.'
    },
    logoutSuccess: {
      title: 'Bye',
      content: 'see you next time.'
    }
  },
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
  preview: {
    nav: {
      userGuide: 'User Guide',
      github: 'Github'
    },
    tip: {
      title: 'Preview Mode',
      message: 'To provide the same experience, you cannot change the theme style or the file repository path in this mode, but you are free to upload and download file.'
    },
    notSupport: 'Sorry, a preview of this file is not supported.'
  },
  menu: {
    index: 'Home',
    allFile: 'File',
    setting: 'Setting',
    language: 'Language'
  },
  footer: {
    aboutMe: 'About me',
    copyRight: 'Copyright © 2019 Sloaix',
    version: 'Build Version'
  },
  allFile: {
    rootDir: 'Root',
    parentDir: 'Back',
    upload: 'Upload',
    name: 'Name',
    size: 'Size',
    action: 'Action',
    lastModified: 'Last Modified',
    download: 'Download'
  },
  network: {
    error: 'Network connection occur error, please check your network and try again later.'
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
    accountSetting: 'Account',
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
      password: {
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        placeHolderForNewPassword: 'input new password',
        placeHolderForConfirmPassword: 'input new password again',
        errorMessage: 'confirmed password error'
      },
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
