import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import reactSvgPlugin from 'vite-plugin-react-svg'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh(), reactSvgPlugin()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    lodash: ['lodash'],
                    rxjs: ['rxjs'],
                    'react-syntax-highlighter': ['react-syntax-highlighter'],
                },
            },
        },
    },
})
