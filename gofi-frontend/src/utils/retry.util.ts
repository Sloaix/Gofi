/**
 * 重试机制工具类
 */
export interface RetryOptions {
    maxRetries?: number
    delay?: number
    backoff?: number
    shouldRetry?: (error: any) => boolean
}

export class RetryUtil {
    /**
     * 执行带重试的异步函数
     * @param fn 要执行的异步函数
     * @param options 重试选项
     */
    static async retry<T>(
        fn: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> {
        const {
            maxRetries = 3,
            delay = 1000,
            backoff = 2,
            shouldRetry = this.defaultShouldRetry
        } = options

        let lastError: any
        let currentDelay = delay

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn()
            } catch (error) {
                lastError = error
                
                // 检查是否应该重试
                if (attempt === maxRetries || !shouldRetry(error)) {
                    throw error
                }

                // 等待后重试
                if (attempt < maxRetries) {
                    await this.sleep(currentDelay)
                    currentDelay *= backoff
                }
            }
        }

        throw lastError
    }

    /**
     * 默认的重试条件
     * @param error 错误对象
     */
    private static defaultShouldRetry(error: any): boolean {
        // 网络错误才重试
        if (error.isAxiosError && !error.response) {
            return true
        }
        
        // 服务器错误（5xx）才重试
        if (error.response && error.response.status >= 500) {
            return true
        }
        
        return false
    }

    /**
     * 延迟函数
     * @param ms 延迟毫秒数
     */
    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * 创建带重试的HTTP请求函数
     * @param httpClient HTTP客户端（如axios实例）
     * @param options 重试选项
     */
    static createRetryHttpClient(httpClient: any, options: RetryOptions = {}) {
        return {
            get: (url: string, config?: any) => 
                this.retry(() => httpClient.get(url, config), options),
            post: (url: string, data?: any, config?: any) => 
                this.retry(() => httpClient.post(url, data, config), options),
            put: (url: string, data?: any, config?: any) => 
                this.retry(() => httpClient.put(url, data, config), options),
            delete: (url: string, config?: any) => 
                this.retry(() => httpClient.delete(url, config), options),
        }
    }
} 