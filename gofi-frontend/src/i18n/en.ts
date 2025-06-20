import common from './en/common'
import component from './en/component'
import form from './en/form'
import pages from './en/pages'
import menu from './en/menu'
import toast from './en/toast'
import tooltip from './en/tooltip'

export default {
    'app.tip.preview-mode':
        'Currently in preview mode, the path to the file storage cannot be changed, but you can download files, and after logging in, you can upload files.',
    ...common,
    ...component,
    ...form,
    ...pages,
    ...menu,
    ...toast,
    ...tooltip,
}
