import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useConfiguration } from '../hook/configuration'
import PageLoading from '../components/PageLoading'

const InitGuard: React.FC = () => {
    const { isInitialized, isLoading } = useConfiguration()
    const location = useLocation()

    if (isLoading) return <PageLoading />

    if (!isInitialized && location.pathname !== '/setup') {
        return <Navigate to="/setup" replace />
    }
    if (isInitialized && location.pathname === '/setup') {
        if (!window.sessionStorage.getItem('justFinishedSetup')) {
            return <Navigate to="/auth/login" replace />
        }
    }
    return <Outlet />
}

export default InitGuard 