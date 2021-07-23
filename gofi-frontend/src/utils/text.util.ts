export default class TextUtil {
    /**
     * 校验string是否为null
     * @param value
     * @returns
     */
    static isEmpty(value: string | undefined | null) {
        if (typeof value == 'string') {
            return value === '' || value === 'null'
        } else {
            return value === undefined || value === null
        }
    }

    static isNotEmpty(value: string | undefined | null) {
        return !this.isEmpty(value)
    }

    /**
     * 添加前缀,如果已经存在前缀直接返回原始值
     * @param value
     * @param prefix
     * @returns
     */
    static withPrefix(value: string, prefix: string) {
        if (!value.startsWith(prefix)) {
            return `${prefix}${value}`
        }
        return value
    }

    static extension(target: string) {
        if (TextUtil.isEmpty(target) || !target.includes('.')) {
            return ''
        }

        const segments = target.split('.')

        if (segments.length == 0) {
            return ''
        }

        return segments[segments.length - 1]
    }
}
