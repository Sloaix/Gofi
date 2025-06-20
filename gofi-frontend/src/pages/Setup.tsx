import { AlertCircle, FolderOpen, Loader2, RotateCcw, ThumbsUp, Globe, Moon, Sun, Laptop, Languages } from 'lucide-react'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import useSWR from 'swr'
import { fetchConfiguration, setup } from '../api/repository'
import logo from '../assets/logo.svg'
import PageLoading from '../components/PageLoading'
import Step from '../components/Step'
import QueryKey from '../constants/swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import ThemeSelect from '@/components/layouts/MainLayout/ThemeSelect'
import LangSelect from '@/components/layouts/MainLayout/LangSelect'
import { useAtom } from 'jotai'
import { languageState, themeState, ThemeMode } from '@/states/common.state'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select'

interface IProps {}

const Setup: React.FC<IProps> = () => {
    const { t, i18n } = useTranslation()
    const [lang, setLang] = useAtom(languageState)
    const [theme, setTheme] = useAtom(themeState)
    const [inputValue, setInputValue] = useState<string>('')
    const [processing, setProcessing] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [isValidating, setIsValidating] = useState<boolean>(false)
    const [successConfig, setSuccessConfig] = useState<any>(null)

    const { data: config, error: configError, mutate } = useSWR(QueryKey.CONFIG, () => fetchConfiguration())

    // 初始化默认值
    useEffect(() => {
        if (config?.defaultStoragePath) {
            console.log('[Setup] useEffect: config.defaultStoragePath', config.defaultStoragePath)
            setInputValue(config.defaultStoragePath)
        }
    }, [config])

    // 路径验证
    const validatePath = useCallback(async (path: string): Promise<boolean> => {
        console.log('[Setup] validatePath called with:', path)
        if (!path.trim()) return false
        const pathRegex = /^[\/\\]?([a-zA-Z0-9\u4e00-\u9fa5\s\-_\.]+[\/\\]?)*$/
        if (!pathRegex.test(path)) {
            setError(t('form.setting.storage.path.validation.invalid'))
            console.warn('[Setup] validatePath failed: invalid format', path)
            return false
        }
        if (path.length > 200) {
            setError(t('pages.setup.error.path-too-long'))
            console.warn('[Setup] validatePath failed: path too long', path)
            return false
        }
        setError('')
        return true
    }, [t])

    // 输入值变化处理
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/\s/g, '').trim()
            setInputValue(value)

            // 清除之前的错误
            if (error) {
                setError('')
            }

            // 实时验证
            if (value) {
                setIsValidating(true)
                validatePath(value).finally(() => setIsValidating(false))
            }
        },
        [error, validatePath],
    )

    // 恢复默认值
    const handleReset = useCallback(() => {
        if (config?.defaultStoragePath) {
            setInputValue(config.defaultStoragePath)
            setError('')
        }
    }, [config?.defaultStoragePath])

    // 步骤国际化
    const steps = useMemo(() => ([
        {
            title: t('pages.setup.step.config'),
            active: true,
            finish: !!successConfig,
        },
        {
            title: t('pages.setup.step.done'),
            active: !!successConfig,
            finish: !!successConfig,
        },
    ]), [t, successConfig])

    // 新增：按钮点击跳转主页（清除 sessionStorage 标记并跳转）
    const handleGoHome = useCallback(() => {
        window.sessionStorage.removeItem('justFinishedSetup')
        mutate()
        window.location.href = '/auth/login'
    }, [mutate])

    // 提交处理
    const handleSubmit = useCallback(async () => {
        console.log('[Setup] handleSubmit called, inputValue:', inputValue)
        if (!inputValue.trim()) {
            setError(t('form.setting.storage.path.validation.required'))
            console.warn('[Setup] handleSubmit: empty input')
            return
        }
        if (!(await validatePath(inputValue))) {
            console.warn('[Setup] handleSubmit: validatePath failed')
            return
        }
        try {
            setProcessing(true)
            setError('')
            console.log('[Setup] handleSubmit: sending setup request', inputValue)
            const newConfig = await setup({ customStoragePath: inputValue })
            console.log('[Setup] handleSubmit: setup response', newConfig)
            if (newConfig?.initialized) {
                setSuccessConfig(newConfig)
                mutate(newConfig, false) // 触发全局配置刷新
                setCompleted()
            } else {
                setError(t('pages.setup.error.init-failed'))
            }
        } catch (err: any) {
            setError(err?.message || t('pages.setup.error.config-failed'))
            console.error('[Setup] handleSubmit: catch error', err)
        } finally {
            setProcessing(false)
        }
    }, [inputValue, validatePath, t, mutate])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit()
        }
    }

    // 设置完成状态
    const setCompleted = useCallback(() => {
        setSuccessConfig({})
        window.sessionStorage.setItem('justFinishedSetup', '1')
    }, [])

    // 加载状态
    if (!config && !configError) {
        return <PageLoading />
    }

    // 配置错误状态
    if (configError) {
        console.error('[Setup] configError:', configError)
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="w-full max-w-md">
                    <div className="bg-card border rounded-lg shadow-lg p-8 text-center space-y-4">
                        <div className="bg-destructive/10 rounded-full p-3 w-fit mx-auto">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">{t('pages.setup.error.load-failed.title')}</h2>
                        <p className="text-sm text-muted-foreground">{t('pages.setup.error.load-failed.desc')}</p>
                        <Button onClick={() => window.location.reload()}>{t('component.exception.refresh-page')}</Button>
                    </div>
                </div>
            </div>
        )
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
            <div className="relative z-20 w-full max-w-md mx-4">
                <div className="bg-transparent sm:bg-card shadow-none sm:shadow-lg rounded-none sm:rounded-lg p-4 sm:p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center space-x-3">
                            <img className="h-8 w-auto" src={logo} alt="Gofi Logo" />
                            <h1 className="text-xl font-bold text-foreground">{t('pages.setup.title')}</h1>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('pages.setup.desc')}</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center">
                        <Step steps={steps} variant="center" />
                    </div>

                    {/* Setup Form */}
                    {!successConfig && (
                        <div className="space-y-4">
                            {/* 语言选择表单项 */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Languages className="h-4 w-4" />
                                    {t('form.setting.language.label', '语言')}
                                </label>
                                <Select value={lang} onValueChange={setLang}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('form.setting.language.placeholder', '选择语言')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="zh-Hans">{t('form.setting.language.zh', '简体中文')}</SelectItem>
                                        <SelectItem value="en">{t('form.setting.language.en', 'English')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* 主题选择表单项 */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    {theme === 'light' && <Sun className="h-4 w-4" />}
                                    {theme === 'dark' && <Moon className="h-4 w-4" />}
                                    {theme === 'system' && <Laptop className="h-4 w-4" />}
                                    {t('form.setting.theme.label', '主题')}
                                </label>
                                <Select value={theme} onValueChange={v => setTheme(v as ThemeMode)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('form.setting.theme.placeholder', '选择主题')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            <div className="flex items-center gap-2"><Sun className="h-4 w-4" />{t('component.theme.light', '亮色')}</div>
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            <div className="flex items-center gap-2"><Moon className="h-4 w-4" />{t('component.theme.dark', '暗色')}</div>
                                        </SelectItem>
                                        <SelectItem value="system">
                                            <div className="flex items-center gap-2"><Laptop className="h-4 w-4" />{t('component.theme.system', '跟随系统')}</div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* 存储路径表单项分组 */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4" />
                                    {t('pages.setup.storage-path')}
                                </label>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder={t('form.setting.storage.path.placeholder')}
                                            className={cn('w-full', { 'ring-2 ring-destructive': !!error })}
                                            value={inputValue}
                                            disabled={processing}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                        />
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        disabled={processing || inputValue === config?.defaultStoragePath}
                                                        onClick={handleReset}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('pages.setup.reset-default')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    {/* Error Message */}
                                    {error && (
                                        <div className="flex items-center gap-2 text-sm text-destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}
                                    {/* Validation Indicator */}
                                    {isValidating && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t('pages.setup.validating')}
                                        </div>
                                    )}
                                </div>
                                {/* Help Text */}
                                <div className="bg-muted/50 rounded-md p-3">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {t('pages.setup.help-text')}
                                    </p>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <Button className="w-full" disabled={processing || !!error} onClick={handleSubmit}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {processing ? t('pages.setup.button.processing') : t('pages.setup.button.submit')}
                            </Button>
                        </div>
                    )}

                    {/* Success Section */}
                    {successConfig && (
                        <div className="text-center space-y-6 py-4">
                            <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto">
                                <ThumbsUp className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-foreground">{t('pages.setup.success.title')}</h2>
                                <p className="text-sm text-muted-foreground">{t('pages.setup.success.desc')}</p>
                            </div>
                            <Button className="w-full" onClick={handleGoHome}>
                                {t('pages.setup.success.button')}
                            </Button>
                        </div>
                    )}
                </div>
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

export default Setup
