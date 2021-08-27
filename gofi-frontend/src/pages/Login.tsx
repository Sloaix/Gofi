import { RiLoginBoxLine } from '@hacknug/react-icons/ri'
import { navigate, RouteComponentProps } from '@reach/router'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import backgroundImage from '../assets/login.svg'
import logo from '../assets/logo.svg'
import Button from '../components/Button'
import Checkbox from '../components/form/Checkbox'
import Input from '../components/form/Input'
import PureLayout from '../components/layouts/PureLayout'
import Tooltip from '../components/Tooltip'
import { useStore } from '../stores'
import EnvUtil from '../utils/env.util'
import Toast from '../utils/toast.util'

interface IProps extends RouteComponentProps {}

const defualtProps: IProps = {}

const Login: React.FC<IProps> = (props) => {
    const { userStore } = useStore()
    const { t } = useTranslation()
    if (userStore.isLogin) {
        navigate('/')
    }

    const loginStore = useLocalObservable(() => ({
        rememberme: true,
        username: '',
        password: '',
        submiting: false,
        setRememberme(value: boolean) {
            this.rememberme = value
        },
        setUsername(value: string) {
            this.username = value
        },
        setPassword(value: string) {
            this.password = value
        },
        setSubmiting(value: boolean) {
            this.submiting = value
        },
        get isReady() {
            if (this.username && this.password) {
                return true
            } else {
                return false
            }
        },
        get isInValid() {
            return !this.isReady
        },
        async onSubmit() {
            if (loginStore.isInValid) {
                return
            }
            try {
                this.submiting = true
                // 延迟1秒,让动画柔和
                setTimeout(async () => {
                    const logined = await userStore.login(
                        { username: this.username, password: this.password },
                        this.rememberme,
                    )
                    this.submiting = false
                    if (logined) {
                        Toast.s(t('toast.login-success'))
                        navigate('/', { replace: true })
                    }
                }, 1000)
            } catch (error) {
                this.submiting = false
            }
        },
    }))

    return (
        <PureLayout>
            {/* <!-- card start --> */}
            <div className="bg-opacity-90 max-w-md m-auto p-10 rounded-md transition-all shadow-2xl bg-white border border-gray-300 w-full flex flex-col items-center">
                {/* <!-- logo start --> */}
                <div className="flex flex-col items-center justify-center">
                    <img className="h-12" src={logo} />
                    <span className="pb-10 pt-4 font-semibold text-4xl text-gray-700">Go File Indexer</span>
                </div>
                {/* <!-- logo end --> */}
                {/* <!-- login form start --> */}
                <form className="space-y-6 flex flex-col w-full" action="#" method="POST">
                    {/* <input type='hidden' name='remember' value={true} /> */}
                    <div className="flex flex-col w-full space-y-4">
                        <Input
                            placeholder={
                                EnvUtil.isPreviewMode
                                    ? `${t('pages.login.form.input.placeholder.username')}: admin`
                                    : t('pages.login.form.input.placeholder.username')
                            }
                            fullWidth={true}
                            value={loginStore.username}
                            onChange={(e) => {
                                loginStore.setUsername(e.target.value)
                            }}
                        />
                        <Input
                            placeholder={
                                EnvUtil.isPreviewMode
                                    ? `${t('pages.login.form.input.placeholder.password')}: password`
                                    : t('pages.login.form.input.placeholder.password')
                            }
                            fullWidth={true}
                            type="password"
                            value={loginStore.password}
                            onEnterPress={loginStore.onSubmit}
                            onChange={(e) => {
                                loginStore.setPassword(e.target.value)
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Checkbox
                                checked={loginStore.rememberme}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    loginStore.setRememberme(e.target.checked)
                                }}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                {t('pages.login.form.checkbox.rememberme')}
                            </label>
                        </div>

                        {/* <div className="text-sm">
                            <Tooltip title="请联系管理员">
                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    {t('pages.login.label.forget-password')}
                                </a>
                            </Tooltip>
                        </div> */}
                    </div>

                    <Button
                        fullWidth={true}
                        icon={<RiLoginBoxLine />}
                        loading={loginStore.submiting}
                        onClick={loginStore.onSubmit}
                        disabled={loginStore.isInValid}
                    >
                        {t('pages.login.form.button.signin')}
                    </Button>
                </form>
                {/* <!-- login form end --> */}
            </div>
            {/* <!-- bg start --> */}
            <img src={backgroundImage} className="absolute inset-0 w-full h-full blur-md" style={{ zIndex: -1 }} />
            {/* <!-- bg end --> */}
            {/* <!-- mask start --> */}
            <div
                className="absolute inline-block inset-0 w-full h-full bg-black opacity-40"
                style={{ zIndex: -1 }}
            ></div>
            {/* <!-- mask end --> */}
        </PureLayout>
    )
}

Login.defaultProps = defualtProps

export default observer(Login)
