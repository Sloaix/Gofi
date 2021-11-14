import { RiLoginBoxLine } from '@hacknug/react-icons/ri'
import Joi from 'joi'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { login } from '../api/repository'
import backgroundImage from '../assets/login.svg'
import logo from '../assets/logo.svg'
import Button from '../components/Button'
import Input from '../components/form/Input'
import PureLayout from '../components/layouts/PureLayout'
import { TOKEN } from '../constants/storage'
import { tokenState } from '../states/common.state'
import EnvUtil from '../utils/env.util'
import Toast from '../utils/toast.util'

interface IProps {}

const defualtProps: IProps = {}

const formValidator = Joi.object({
    username: Joi.string().required().messages({
        'any.required': `用户名不能为空`,
        'string.empty': `用户名不能为空`,
    }),
    password: Joi.string().required().messages({
        'any.required': `密码不能为空`,
        'string.empty': `密码不能为空`,
    }),
})

const Login: React.FC<IProps> = (props) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    const setToken = useSetRecoilState(tokenState)

    // 校验表单
    const valiteForm = (): boolean => {
        const formFields = {
            username,
            password,
        }

        const result = formValidator.validate(formFields)

        console.log(result)

        if (result.error) {
            Toast.e(`${result.error.message}`)
            setError(result.error.message)
            return false
        }

        return true
    }

    const trySubmit = async () => {
        if (!valiteForm()) {
            return
        }

        try {
            setProcessing(true)
            const token = await login({ username: username, password: password })

            if (token) {
                // save state
                setToken(token)
                sessionStorage.setItem(TOKEN, token)

                Toast.s(t('toast.login-success'))
                navigate('/', { replace: true })
            }
        } catch (error) {
        } finally {
            setProcessing(false)
        }
    }

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
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value)
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
                            value={password}
                            onEnterPress={trySubmit}
                            onChange={(e) => {
                                setPassword(e.target.value)
                            }}
                        />
                    </div>
                    <Button
                        fullWidth={true}
                        icon={<RiLoginBoxLine />}
                        loading={processing}
                        onClick={trySubmit}
                        disabled={processing}
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

export default Login
