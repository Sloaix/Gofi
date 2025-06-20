import React, { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import useSWR from 'swr'
import { fetchConfiguration } from '../api/repository'
import PageLoading from '../components/PageLoading'
import QueryKey from '../constants/swr'
import { appRoutes, setupRoutes } from './routes'
import InitGuard from './InitGuard'

declare global {
    interface Window {
        LOADED: boolean
    }
}

const AppRoutes: React.FC = () => {
    const { data: config, error } = useSWR(QueryKey.CONFIG, () => fetchConfiguration())
    // 用InitGuard包裹原有路由
    const guardedRoutes = [
        {
            element: <InitGuard />,
            children: [
                ...setupRoutes,
                ...appRoutes,
            ],
        },
    ]
    return useRoutes(guardedRoutes)
}

const GofiRouter: React.FC = () => {
    return (
        <Suspense fallback={<PageLoading />}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </Suspense>
    )
}

export default GofiRouter
