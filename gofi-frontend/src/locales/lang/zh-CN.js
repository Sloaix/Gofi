export default {
  title: {
    userType: '用户类型',
    username: '用户名',
    password: '密码',
    changePassword: '修改密码',
    newPassword: '新密码',
    confirmPassword: '确认密码'
  },
  description: {
    admin: '管理员',
    normalUser: '普通用户',
    hasBeenSet: '已设置',
    ChangePasswordSoonTip: '为保证您的账户安全，首次登录后请尽快修改密码。',
    placeHolderForNewPassword: '请输入新密码',
    placeHolderForConfirmPassword: '请再次输入新密码',
    confirmPasswordError: '确认密码错误',
    changeSuccess: '修改成功',
    usernameOrPasswordWrong: '用户名或密码错误',
    forgetPassword: '忘记密码?',
    contactAdmin: '请联系管理员'
  },
  action: {
    edit: '编辑',
    cancel: '取消',
    submit: '提交',
    save: '保存',
    modify: '修改',
    confirm: '确认',
    login: '登录',
    logout: '登出'
  },
  auth: {
    requireAuth: {
      content: '请先登录'
    },
    logoutConfirm: {
      title: '警告',
      content: '真的要注销登录吗？'
    },
    loginSuccess: {
      title: '欢迎',
      content: '欢迎回来'
    },
    logoutSuccess: {
      title: '再见',
      content: '下次再见'
    }
  },
  notice: {
    switchLanguage: '正在切换语言...'
  },
  setup: {
    step1: {
      name: '安装'
    },
    step2: {
      name: '完成',
      title: 'Gofi 安装成功',
      description: '{0} 秒后自动进入主页，以下信息你可以在设置页面进行查看',
      fileStoragePath: '文件仓库',
      logDirectoryPath: '日志文件夹',
      sqlite3DbFilePath: 'Sqlite3数据库文件',
      defaultLanguage: '默认语言'
    }
  },
  preview: {
    nav: {
      userGuide: '使用文档',
      github: 'Github'
    },
    tip: {
      title: '当前处于预览模式',
      message: '为了提供一致的体验，在该模式下，无法更改主题样式，也无法更改文件仓库路径，但是您可以自由进行上传下载测试。'
    },
    notSupport: '非常抱歉，暂不支持对该文件的预览'
  },
  menu: {
    index: '首页',
    allFile: '所有文件',
    setting: '设置',
    language: '语言(Lang)'
  },
  footer: {
    aboutMe: '关于我',
    copyRight: 'Copyright © 2019 Sloaix',
    version: '构建版本'
  },
  allFile: {
    rootDir: '根目录',
    parentDir: '返回',
    upload: '上传',
    name: '名称',
    size: '大小',
    action: '操作',
    lastModified: '最后修改时间',
    download: '下载'
  },
  network: {
    error: '网络连接出现错误，请检查您的网络，稍后再试。'
  },
  upload: {
    failed: '上传失败',
    success: '上传成功',
    fileUploading: '{0} 上传中...',
    uploadFailed: '{0} 上传失败',
    uploadSuccess: '{0} 上传成功'
  },
  fallback: {
    saveSuccess: '保存成功',
    saveFailed: '保存失败',
    submitSuccess: '提交成功',
    submitFailed: '提交失败',
    error: '错误',
    installFailed: '安装失败'
  },
  setting: {
    accountSetting: '账户与密码',
    baseSetting: '基本设置',
    customSetting: '个性化'
  },
  form: {
    button: {
      home: {
        name: '主页'
      },
      save: {
        name: '保存'
      },
      submit: {
        name: '提交'
      }
    },
    select: {
      fileStorageType: {
        def: '默认',
        custom: '指定'
      },
      language: {
        name: '语言(Lang)',
        errorMessage: '请选择语言'
      }
    },
    input: {
      password: {
        newPassword: '新密码',
        confirmPassword: '确认密码',
        placeHolderForNewPassword: '请输入新密码',
        placeHolderForConfirmPassword: '请再次输入新密码',
        errorMessage: '两次输入的密码不一致'
      },
      fileStoragePath: {
        name: '文件仓库',
        placeholder: '请输入文件夹的绝对路径',
        errorMessage: '文件夹路径必须填写'
      },
      navMode: {
        name: '导航模式',
        top: '顶部栏导航',
        side: '侧边栏导航'
      },
      themeStyle: {
        name: '主题风格',
        light: '亮色风格菜单',
        dark: '暗色风格菜单'
      }
    }
  }
}
