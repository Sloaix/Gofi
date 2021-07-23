import { navigate, Redirect, RouteComponentProps, Router } from '@reach/router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import Setting from '../pages/admin/Setting'
import UnAuthorized from '../pages/exception/403'
import NotFound from '../pages/exception/404'
import ServerError from '../pages/exception/500'
import FileDetail from '../pages/file/FileDetail'
import FileViewer from '../pages/file/FileViewer'
import Login from '../pages/Login'
import Preview from '../pages/Preview'
import Setup from '../pages/Setup'
import { useStore } from '../stores'

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
                    <Preview path="/preview" />
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

    return <Router className="h-full w-full">{routes}</Router>
}

GofiRouter.defaultProps = defualtProps

export default observer(GofiRouter)
