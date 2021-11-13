import React from 'react'
import ReactDOM from 'react-dom'
import { Middleware, SWRConfig } from 'swr'
import App from './App'
import './i18n'
import './index.css'
const cache = new Map()

const logger: Middleware = (useSWRNext) => {
    return (key, fetcher, config) => {
        // 将日志记录器添加到原始 fetcher。
        const extendedFetcher = (...args: any[]) => {
            console.log('SWR Request:', key)
            return (fetcher as any)(...args)
        }

        // 使用新的 fetcher 执行 hook。
        return useSWRNext(key, extendedFetcher, config)
    }
}

const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    provider: () => cache,
    use: [logger],
}

ReactDOM.render(
    <SWRConfig value={swrConfig}>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </SWRConfig>,
    document.getElementById('root'),
)
