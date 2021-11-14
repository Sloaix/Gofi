import { observer } from 'mobx-react-lite'
import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import useSWR from 'swr'
import { fetchConfiguration } from '../api/repository'
import PageLoading from '../components/PageLoading'
import QueryKey from '../constants/swr'
import { useCurrentUser } from '../hook/user'

const NotFound = lazy(() => import('../pages/exception/404'))
const UnAuthorized = lazy(() => import('../pages/exception/403'))
const ServerError = lazy(() => import('../pages/exception/500'))
const Setting = lazy(() => import('../pages/admin/setting/Index'))
const FileDetail = lazy(() => import('../pages/file/FileDetail'))
const FileViewer = lazy(() => import('../pages/file/FileViewer'))
const Login = lazy(() => import('../pages/Login'))
const Setup = lazy(() => import('../pages/Setup'))

declare global {
    interface Window {
        LOADED: boolean
    }
}

interface IProps {}

const defualtProps: IProps = {}

const GofiRouter: React.FC<IProps> = (props) => {
    const { user } = useCurrentUser()
    const { data: config, error } = useSWR(QueryKey.CONFIG, () => fetchConfiguration())

    if (!config && !error) {
        return <PageLoading />
    }

    const renderRoutes = () => {
        if (!config) {
            console.log('is fetching config ...')
            // is fetching config ...
            return <Route path="*" element={<PageLoading />} />
        } else if (config.initialized) {
            console.log('gofi is initialized,redirect to /')
            return (
                <>
                    <Route path="/" element={<Navigate to="/file/viewer" replace={true} />} />
                    <Route path="/file/viewer" element={<FileViewer />} />
                    <Route path="/file/detail" element={<FileDetail />} />
                    <Route path="/admin/setting" element={user ? <Setting /> : <Navigate to="/" />} />
                    <Route path="/auth/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="/403" element={<UnAuthorized />} />
                    <Route path="/500" element={<ServerError />} />
                    <Route path="*" element={<Navigate to="/404" replace={true} />} />
                </>
            )
        } else {
            console.log('gofi need setup')
            // gofi need setup, redirect to setup
            return (
                <>
                    <Route path="*" element={<Navigate to="/setup" replace={true} />} />
                    <Route path="/setup" element={<Setup />} />
                </>
            )
        }
    }

    return (
        <Suspense fallback={<PageLoading />}>
            <BrowserRouter>
                <Routes>{renderRoutes()}</Routes>
            </BrowserRouter>
        </Suspense>
    )
}

GofiRouter.defaultProps = defualtProps

export default (GofiRouter)
