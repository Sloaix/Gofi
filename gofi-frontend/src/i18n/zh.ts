import component from './zh/component'
import menu from './zh/menu'
import pages from './zh/pages'
import toast from './zh/toast'
import tooltip from './zh/tooltip'

export default {
    'app.tip.preview-mode': '当前处于预览模式，文件仓库的路径无法被更改，但您可以下载文件,在登录后,您可以上传文件。',
    ...menu,
    ...pages,
    ...tooltip,
    ...component,
    ...toast,
}
