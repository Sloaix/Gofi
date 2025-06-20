import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hook/user'

const PublicRoute: React.FC = () => {
    const { user } = useCurrentUser()

    if (user) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default PublicRoute 