import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { toast } from 'sonner'
import PageLoading from '../components/PageLoading'
import { useCurrentUser } from '../hook/user'
import i18n from '../i18n'

const ProtectedRoute: React.FC = () => {
    const { user, isLoading } = useCurrentUser()

    if (isLoading) {
        return <PageLoading />
    }

    if (!user) {
        toast.warning(i18n.t('toast.require-login'), {
            id: 'require-login',
        })
        return <Navigate to="/auth/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute 