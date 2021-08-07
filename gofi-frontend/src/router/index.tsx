import { navigate, Redirect, Router } from '@reach/router'
import { observer } from 'mobx-react-lite'
import React, { lazy, Suspense, useEffect, useState } from 'react'
import Loading from '../components/Loading'
import { useStore } from '../stores'

const NotFound = lazy(() => import('../pages/exception/404'))
const UnAuthorized = lazy(() => import('../pages/exception/403'))
const ServerError = lazy(() => import('../pages/exception/500'))
const Setting = lazy(() => import('../pages/admin/Setting'))
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
    const [routes, setRoutes] = useState<React.ReactNode>()

    const routesIfLogin = [
        <Redirect from="/auth/login" to="/" key="/auth/login" noThrow />,
        <Setting path="/admin/setting" key="/admin/setting" />,
    ]

    const routesIfNotLogin = [
        <Login path="/auth/login" key="/auth/login" />,
        <Redirect from="/admin/setting" to="/auth/login" key="/admin/setting" noThrow />,
    ]

    const protectRoutes = () => {
        const routes = userStore.isLogin ? routesIfLogin : routesIfNotLogin
        return routes
    }

    useEffect(() => {
        if (!config) {
            console.log('is fetching config ...')
            // is fetching config ...
            setRoutes(<Loading default />)
        } else if (config.initialized) {
            // gofi is initialized,redirect to /
            console.log('gofi is initialized,redirect to /')
            setRoutes(
                <>
                    {/* noThrow 属性可以避免抛出异常,由于重定向会导致重新创建组件,react会抛出异常 */}
                    {/* The nosthrow attribute can avoid throwing exceptions. Because redirection will lead to the re creation of components, react will throw exceptions */}
                    <Redirect from="/" to="/file/viewer" noThrow />
                    <FileViewer path="/file/viewer" />
                    <FileDetail path="/file/detail" />
                    {protectRoutes()}
                    <NotFound path="/404" />
                    <UnAuthorized path="/403" />
                    <ServerError path="/500" />
                    <Redirect from="/*" to="/404" noThrow />
                </>,
            )
        } else {
            console.log('gofi need setup')
            navigate('/')
            // gofi need setup, redirect to setup
            setRoutes(
                <>
                    <Redirect from="/*" to="/" noThrow />
                    <Setup path="/" defaultStoragePath={config.defaultStoragePath} />
                </>,
            )
        }
    }, [config, config?.initialized, userStore.isLogin])

    return (
        <Suspense fallback={<Loading />}>
            <Router className="h-full w-full">{routes}</Router>
        </Suspense>
    )
}

GofiRouter.defaultProps = defualtProps

export default observer(GofiRouter)
