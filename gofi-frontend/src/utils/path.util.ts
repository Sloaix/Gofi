/**
 * 路径处理工具类
 * 处理前端路径的编码和解码逻辑
 */
import TextUtil from './text.util'

export default class PathUtil {
    /**
     * 解码路径 - 确保所有已编码的路径都能正确解码
     * @param path 可能包含编码字符的路径
     * @returns 解码后的路径
     */
    static decodePath(path: string): string {
        if (!path) return path
        
        try {
            // 如果路径包含编码字符，进行解码
            if (path.includes('%')) {
                return decodeURIComponent(path)
            }
            return path
        } catch (e) {
            console.warn('[PathUtil] 路径解码失败，使用原始路径:', e)
            return path
        }
    }

    /**
     * 编码路径 - 仅用于网络传输（API请求）
     * @param path 原始路径
     * @returns 编码后的路径
     */
    static encodePath(path: string): string {
        if (!path) return path
        return encodeURIComponent(path)
    }

    /**
     * 从URL路径中提取文件路径
     * @param pathname 浏览器的pathname
     * @returns 解码后的文件路径
     */
    static extractPathFromUrl(pathname: string): string {
        const pathSegments = pathname.split('/')
        
        if (pathSegments[1] === 'file' && pathSegments.length > 2) {
            // 从 /file/path/to/file.jpg 中提取 path/to/file.jpg
            const filePath = '/' + pathSegments.slice(2).join('/')
            return this.decodePath(filePath)
        }
        return '/'
    }

    /**
     * 构建文件URL路径 - 不进行编码，保持原始路径
     * @param filePath 文件路径
     * @returns URL路径
     */
    static buildFileUrl(filePath: string): string {
        if (!filePath || filePath === '/') {
            return '/file/'
        }
        
        // 去掉开头的斜杠，然后构建URL
        const pathWithoutSlash = filePath.startsWith('/') ? filePath.substring(1) : filePath
        return `/file/${pathWithoutSlash}`
    }

    /**
     * 检查路径是否包含编码字符
     * @param path 路径字符串
     * @returns 是否包含编码字符
     */
    static isEncoded(path: string): boolean {
        return path.includes('%')
    }

    /**
     * 将path转换成segment数组,a/b/c=>[a,b,c],/a/b=>[a,b]
     */
    static convertPathToSegments(path: string): string[] {
        let segments = path.split('/')?.filter((segment) => TextUtil.isNotEmpty(segment))
        if (!segments) {
            segments = []
        }
        return segments
    }

    /**
     * 根据给定的path,返回上一级的path
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

    /**
     * 从URL中提取文件名。
     * 优先尝试从'path'查询参数中解析，如果失败则从URL路径名中解析。
     */
    static getFileNameFromUrl(url: string): string {
        try {
            const urlObject = new URL(url)
            const path = urlObject.searchParams.get('path')
            if (path) {
                const parts = path.split('/')
                return parts[parts.length - 1]
            }
            // 如果无法从path参数获取，则尝试从pathname获取
            const pathnameParts = urlObject.pathname.split('/')
            return this.decodePath(pathnameParts[pathnameParts.length - 1])
        } catch (e) {
            return url
        }
    }
} 