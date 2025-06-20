import React from 'react'
import { createRoot } from 'react-dom/client'
import { Middleware, SWRConfig } from 'swr'
import App from './App'
import './i18n'
import './index.css'
import 'github-markdown-css/github-markdown-light.css'

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
    onError: (error: any) => {
        // 处理404错误，自动跳转到404页面
        const errorCode = error?.code || error?.status || error?.response?.status
        if (errorCode === 404) {
            // 使用window.location避免路由冲突
            window.location.href = '/404'
            return
        }
        
        // 处理其他错误
        if (errorCode === 403) {
            window.location.href = '/403'
            return
        }
        
        if (errorCode === 500) {
            window.location.href = '/500'
            return
        }
        
        console.error('SWR Error:', error)
    }
}

const container = document.getElementById('root')
if (container) {
    const root = createRoot(container)
    root.render(
        <SWRConfig value={swrConfig}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </SWRConfig>
    )
}

// 动态切换github-markdown-dark.css
function updateMarkdownTheme() {
  const id = 'github-markdown-dark-theme';
  const dark = document.documentElement.classList.contains('dark');
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (dark) {
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = id;
      link.href = '/node_modules/github-markdown-css/github-markdown-dark.css';
      document.head.appendChild(link);
    }
  } else {
    if (link) link.remove();
  }
}

// 监听主题变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      updateMarkdownTheme();
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

// 初始化主题
updateMarkdownTheme();
