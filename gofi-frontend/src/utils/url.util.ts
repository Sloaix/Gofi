import TextUtil from './text.util'

export default class UrlUtil {
    /**
     * 将path转换成segment数组,a/b/c=>[a,b,c],/a/b=>[a,b]
     * @param path /a/b/c
     * @returns segments [a,b,c]
     */
    static convertPathToSegments(path: string): string[] {
        // 转换成数组,并且过滤掉空字符串
        let segments = path.split('/')?.filter((segment) => TextUtil.isNotEmpty(segment))
        if (!segments) {
            segments = []
        }
        return segments
    }

    /**
     * 根据给定的path,返回上一级的path
     * @param path /a/b/c
     * @param parentPath /a/b
     * @returns parentPath if exist,or false if not exist.
     */
    static parentPath(path: string | null | undefined): string {
        if (!path) {
            return ''
        }

        if (TextUtil.isEmpty(path) || path.trim() === '/') {
            return ''
        }

        if (!path.startsWith('/')) {
            path = `/${path}`
        }

        let segments = this.convertPathToSegments(path)
        if (segments.length == 0) {
            return ''
        }

        const length = segments.length
        let parentSegments = segments.slice(0, length - 1).filter((segment) => TextUtil.isNotEmpty(segment))

        if (parentSegments.length === 0) {
            return '/'
        }

        let parentPath = parentSegments.join('/').trim()

        if (!parentPath.startsWith('/')) {
            parentPath = `/${parentPath}`
        }

        return parentPath
    }

    static attachQueryTo(path: string, querys: Record<string, string>): string {
        const query = new URLSearchParams(querys)

        return `${path}?${query.toString()}`
    }
}
