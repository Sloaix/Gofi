export default {
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
  menu: {
    index: '首页',
    allFile: '所有文件',
    setting: '设置'
  },
  footer: {
    aboutMe: '关于我',
    copyRight: 'Copyright © 2019 Sloaix',
    version: '当前版本'
  },
  allFile: {
    rootDir: '根目录',
    parentDir: '上级目录',
    upload: '上传',
    name: '名称',
    size: '大小',
    action: '操作',
    lastModified: '最后修改时间',
    download: '下载'
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
