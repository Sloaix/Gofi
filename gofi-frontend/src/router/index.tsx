import { observer } from 'mobx-react-lite'
import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Loading from '../components/Loading'
import { useStore } from '../stores'

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
    const { appStore, userStore } = useStore()
    const { config } = appStore

    const renderRoutes = () => {
        if (!config) {
            console.log('is fetching config ...')
            // is fetching config ...
            return <Route path="*" element={<Loading />} />
        } else if (config.initialized) {
            console.log('gofi is initialized,redirect to /')
            return (
                <>
                    <Route path="/" element={<Navigate to="/file/viewer" replace={true} />} />
                    <Route path="/file/viewer" element={<FileViewer />} />
                    <Route path="/file/detail" element={<FileDetail />} />
                    <Route path="/admin/setting" element={userStore.isLogin ? <Setting /> : <Navigate to="/" />} />
                    <Route path="/auth/login" element={!userStore.isLogin ? <Login /> : <Navigate to="/" />} />
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
                    <Route path="*" element={<Navigate to="/" replace={true} />} />
                    <Route path="/" element={<Setup defaultStoragePath={config.defaultStoragePath} />} />
                </>
            )
        }
    }

    return (
        <Suspense fallback={<Loading />}>
            <BrowserRouter>
                <Routes>{renderRoutes()}</Routes>
            </BrowserRouter>
        </Suspense>
    )
}

GofiRouter.defaultProps = defualtProps

export default observer(GofiRouter)
