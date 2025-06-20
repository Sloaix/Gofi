import { RiLoginBoxLine } from 'react-icons/ri'
import { Loader2 } from 'lucide-react'
import Joi from 'joi'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { login } from '../api/repository'
import logo from '../assets/logo.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TOKEN } from '../constants/storage'
import { tokenState } from '../states/common.state'
import EnvUtil from '../utils/env.util'
import Toast from '../utils/toast.util'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface IProps {}

const defualtProps: IProps = {}

interface FormErrors {
    username?: string
    password?: string
}

interface TouchedFields {
    username: boolean
    password: boolean
}

const Login: React.FC<IProps> = (props) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [processing, setProcessing] = useState(false)
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [touchedFields, setTouchedFields] = useState<TouchedFields>({
        username: false,
        password: false,
    })
    const [isFormValid, setIsFormValid] = useState(false)

    const setToken = useSetAtom(tokenState)

    const formValidator = Joi.object({
        username: Joi.string().required().messages({
            'any.required': t('form.login.validation.username-required'),
            'string.empty': t('form.login.validation.username-required'),
        }),
        password: Joi.string().required().messages({
            'any.required': t('form.login.validation.password-required'),
            'string.empty': t('form.login.validation.password-required'),
        }),
    })

    // 实时验证表单
    useEffect(() => {
        const validateForm = () => {
            const formFields = { username, password }
            const result = formValidator.validate(formFields, { abortEarly: false })

            if (result.error) {
                const errors: FormErrors = {}
                result.error.details.forEach((detail) => {
                    const field = detail.path[0] as keyof FormErrors
                    // 只有当字段被触摸过且为空时才显示错误
                    if (touchedFields[field as keyof TouchedFields]) {
                        errors[field] = detail.message
                    }
                })
                setFormErrors(errors)
                setIsFormValid(false)
            } else {
                setFormErrors({})
                setIsFormValid(true)
            }
        }

        validateForm()
    }, [username, password, touchedFields])

    // 标记字段为已触摸
    const markFieldAsTouched = (field: keyof TouchedFields) => {
        setTouchedFields((prev) => ({
            ...prev,
            [field]: true,
        }))
    }

    // 清除特定字段的错误
    const clearFieldError = (field: keyof FormErrors) => {
        setFormErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
        })
    }

    // 校验表单
    const valiteForm = (): boolean => {
        const formFields = {
            username,
            password,
        }

        const result = formValidator.validate(formFields, { abortEarly: false })

        if (result.error) {
            const errors: FormErrors = {}
            result.error.details.forEach((detail) => {
                const field = detail.path[0] as keyof FormErrors
                errors[field] = detail.message
            })
            setFormErrors(errors)

            // 标记所有字段为已触摸，这样错误就会显示
            setTouchedFields({
                username: true,
                password: true,
            })

            // 显示第一个错误
            const firstError = result.error.details[0]
            Toast.e(firstError.message)
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
        } catch (error: any) {
            // 错误处理已经在HTTP拦截器中处理，这里不需要额外处理
            console.error('Login error:', error)
        } finally {
            setProcessing(false)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            trySubmit()
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[15%] left-[10%] w-32 h-32 bg-primary/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-[15%] right-[10%] w-48 h-48 bg-primary/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[25%] w-24 h-24 bg-primary/5 rounded-md animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-[25%] left-[30%] w-20 h-20 bg-primary/10 rounded-md animate-float" style={{ animationDelay: '3s' }}></div>
                <div className="absolute bottom-[40%] right-[35%] w-24 h-24 bg-primary/10 triangle animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* 主要内容 */}
            <div className="relative z-20 w-full max-w-md">
                <Card className="bg-transparent sm:bg-card shadow-none sm:shadow-lg rounded-none sm:rounded-lg p-4 sm:p-8">
                    <CardHeader>
                        <div className="flex flex-col items-center justify-center">
                            <img className="h-12" src={logo} alt="Logo" />
                            <span className="pt-4 font-semibold text-3xl text-foreground">
                                Go File Indexer
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="space-y-6 flex flex-col w-full"
                            onSubmit={(e) => { e.preventDefault(); trySubmit(); }}
                        >
                            <div className="flex flex-col w-full space-y-4">
                                <div className="space-y-1">
                                    <Input
                                        placeholder={
                                            EnvUtil.isPreviewMode
                                                ? `${t('form.login.input.username-placeholder')}: admin`
                                                : t('form.login.input.username-placeholder')
                                        }
                                        value={username}
                                        className={cn('w-full', { 'ring-2 ring-destructive': formErrors.username })}
                                        onChange={(e) => {
                                            setUsername(e.target.value)
                                            clearFieldError('username')
                                        }}
                                        onBlur={() => markFieldAsTouched('username')}
                                    />
                                    {formErrors.username && (
                                        <p className="text-sm text-destructive px-1">
                                            {formErrors.username}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        placeholder={
                                            EnvUtil.isPreviewMode
                                                ? `${t('form.login.input.password-placeholder')}: password`
                                                : t('form.login.input.password-placeholder')
                                        }
                                        type="password"
                                        value={password}
                                        className={cn('w-full', { 'ring-2 ring-destructive': formErrors.password })}
                                        onKeyDown={handleKeyDown}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            clearFieldError('password')
                                        }}
                                        onBlur={() => markFieldAsTouched('password')}
                                    />
                                    {formErrors.password && (
                                        <p className="text-sm text-destructive px-1">
                                            {formErrors.password}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RiLoginBoxLine className="mr-2 h-4 w-4" />
                                )}
                                {processing
                                    ? t('form.login.button.signing')
                                    : t('form.login.button.signin')}
                            </Button>
                        </form>

                        {EnvUtil.isPreviewMode && (
                            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg w-full text-center">
                                <p className="text-sm text-blue-700">
                                    <strong>{t('common.demo-mode')}</strong>{' '}
                                    {t('common.username-label')}: admin, {t('common.password-label')}: password
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {/* 波浪背景 */}
            <div className="absolute bottom-0 left-0 w-full text-primary z-10">
                <svg
                    className="waves"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 24 150 28"
                    preserveAspectRatio="none"
                    shapeRendering="auto"
                >
                    <defs>
                        <path
                            id="gentle-wave"
                            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                        />
                    </defs>
                    <g className="parallax">
                        <use
                            xlinkHref="#gentle-wave"
                            x="48"
                            y="0"
                            fill="currentColor"
                            opacity="0.15"
                        />
                        <use
                            xlinkHref="#gentle-wave"
                            x="48"
                            y="3"
                            fill="currentColor"
                            opacity="0.1"
                        />
                        <use
                            xlinkHref="#gentle-wave"
                            x="48"
                            y="5"
                            fill="currentColor"
                            opacity="0.05"
                        />
                        <use
                            xlinkHref="#gentle-wave"
                            x="48"
                            y="7"
                            fill="currentColor"
                            opacity="0.2"
                        />
                    </g>
                </svg>
            </div>

            <style>{`
                .waves {
                    position: relative;
                    width: 100%;
                    height: 15vh;
                    margin-bottom: -7px; /* Fix for safari gap */
                    min-height: 100px;
                    max-height: 150px;
                }

                .parallax > use {
                    animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
                }
                .parallax > use:nth-child(1) {
                    animation-delay: -2s;
                    animation-duration: 7s;
                }
                .parallax > use:nth-child(2) {
                    animation-delay: -3s;
                    animation-duration: 10s;
                }
                .parallax > use:nth-child(3) {
                    animation-delay: -4s;
                    animation-duration: 13s;
                }
                .parallax > use:nth-child(4) {
                    animation-delay: -5s;
                    animation-duration: 20s;
                }

                @keyframes move-forever {
                    0% {
                        transform: translate3d(-90px,0,0);
                    }
                    100% { 
                        transform: translate3d(85px,0,0);
                    }
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .triangle {
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                }
            `}</style>
        </div>
    )
}

export default Login
