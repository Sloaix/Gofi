import React, { lazy } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const NotFound = lazy(() => import('../pages/exception/404'))
const UnAuthorized = lazy(() => import('../pages/exception/403'))
const ServerError = lazy(() => import('../pages/exception/500'))
const Setting = lazy(() => import('../pages/admin/setting/Index'))
const File = lazy(() => import('../pages/file/File'))
const Files = lazy(() => import('../pages/file/Files'))
const FileRouter = lazy(() => import('../pages/file/FileRouter'))
const Login = lazy(() => import('../pages/Login'))
const Setup = lazy(() => import('../pages/Setup'))

export const setupRoutes: RouteObject[] = [
    {
        path: '/setup',
        element: <Setup />,
    },
    {
        path: '*',
        element: <Navigate to="/setup" replace />,
    },
]

export const appRoutes: RouteObject[] = [
    {
        element: <PublicRoute />,
        children: [{ path: '/auth/login', element: <Login /> }],
    },
    {
        path: '/404',
        element: <NotFound />,
    },
    {
        path: '/403',
        element: <UnAuthorized />,
    },
    {
        path: '/500',
        element: <ServerError />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <Navigate to="/file/" replace />,
            },
            {
                path: '/file/*',
                element: <FileRouter />,
            },
            {
                path: '/admin/setting',
                element: <Setting />,
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/404" replace />,
    },
] 