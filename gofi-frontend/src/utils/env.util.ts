export default class EnvUtil {
    static isPreviewMode = import.meta.env.VITE_IS_PREVIEW_MODE === 'true'
    static isDev = import.meta.env.DEV
}
