import menu from './en/menu'
import pages from './en/pages'
import tooltip from './en/tooltip'
import component from './en/component'
import toast from './en/toast'

export default {
    'app.tip.preview-mode':
        'Currently in preview mode, the path to the file storage cannot be changed, but you can download files, and after logging in, you can upload files.',
    ...menu,
    ...pages,
    ...tooltip,
    ...component,
    ...toast
}
