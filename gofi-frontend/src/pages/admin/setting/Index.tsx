import {
    Database,
    Settings,
    Shield,
    Lock,
    Monitor,
    Save,
    X,
    Edit3,
    Check,
    Loader2,
    AlertCircle,
    Info
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSWR, { useSWRConfig } from 'swr'
import { changePassword, fetchConfiguration, updateStoragePath } from '../../../api/repository'
import logo from '../../../assets/logo.svg'
import MainLayout from '../../../components/layouts/MainLayout/Index'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import QueryKey from '../../../constants/swr'
import { useCurrentUser } from '../../../hook/user'
import Toast from '../../../utils/toast.util'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { RiSettings2Line } from 'react-icons/ri'
import PageHeader from '../../../components/PageHeader'

interface IProps {}

const Setting: React.FC<IProps> = () => {
    const [processing, setProcessing] = useState(false)
    const [storagePathInput, setStoragePathInput] = useState<string>()
    const [currentStoragePath, setCurrentStoragePath] = useState<string>()
    const [passwordInput, setPasswordInput] = useState<string>('******')
    const [editingField, setEditingField] = useState<'storage' | 'password' | null>(null)
    const { t } = useTranslation()
    const { user } = useCurrentUser()
    const { data: config, mutate } = useSWR(QueryKey.CONFIG, () => fetchConfiguration())

    useEffect(() => {
        if (config) {
            const path = config.customStoragePath || config.defaultStoragePath
            setCurrentStoragePath(path)
            setStoragePathInput(path)
        }
    }, [config])

    // 修改文件仓库路径
    const handleStoragePathSubmit = async () => {
        if (!storagePathInput?.trim()) {
            Toast.e(t('pages.setting.storage-change-failed'))
            return
        }

        try {
            setProcessing(true)
            await updateStoragePath(storagePathInput)
            await mutate()
            setEditingField(null)
            Toast.s(t('toast.storage-change-success'))
        } catch (error) {
            Toast.e(t('pages.setting.storage-change-failed'))
        } finally {
            setProcessing(false)
        }
    }

    // 修改密码
    const handlePasswordSubmit = async () => {
        if (!passwordInput?.trim() || passwordInput === '******') {
            Toast.e(t('form.setting.password.validation.required'))
            return
        }

        try {
            setProcessing(true)
            await changePassword({ password: passwordInput, confirm: passwordInput })
            setEditingField(null)
            setPasswordInput('******')
            Toast.s(t('toast.password-change-success'))
        } catch (error) {
            Toast.e(t('pages.setting.password-change-failed'))
        } finally {
            setProcessing(false)
        }
    }

    const cancelEdit = () => {
        setEditingField(null)
        setStoragePathInput(currentStoragePath)
        setPasswordInput('******')
    }

    const SettingCard: React.FC<{
        title: string
        description?: string
        icon: React.ReactNode
        children: React.ReactNode
        badge?: string
    }> = ({ title, description, icon, children, badge }) => (
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                </div>
                {badge && <Badge variant="secondary">{badge}</Badge>}
            </div>
            {children}
        </div>
    )

    const EditableField: React.FC<{
        value: string
        placeholder?: string
        isEditing: boolean
        onEdit: () => void
        onCancel: () => void
        onSubmit: () => void
        onChange: (value: string) => void
        processing: boolean
        type?: 'text' | 'password'
    }> = ({ 
        value, 
        placeholder, 
        isEditing, 
        onEdit, 
        onCancel, 
        onSubmit, 
        onChange, 
        processing,
        type = 'text'
    }) => (
        <div className="flex items-center space-x-2">
            {isEditing ? (
                <>
                    <Input
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={processing}
                        className="h-8 px-3 text-sm rounded-md"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSubmit}
                        disabled={processing || !value.trim() || value === '******'}
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                    </Button>
                </>
            ) : (
                <>
                    <div className="flex-1 p-3 bg-muted/50 rounded-md text-sm h-8 flex items-center">
                        {type === 'password' ? '••••••' : value}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        disabled={processing}
                    >
                        <Edit3 className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    )

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* 页面标题 */}
                <PageHeader
                    icon={<RiSettings2Line className="h-6 w-6 text-primary" />}
                    title={t('pages.setting.title')}
                    description={t('pages.setting.description')}
                />

                {/* 合并后的设置卡片 */}
                <Card>
                    <CardContent className="space-y-8 pt-6">
                        {/* 系统信息 */}
                        <div>
                            <div className="flex items-center mb-2">
                                <Monitor className="h-5 w-5 mr-2 text-primary" />
                                <span className="font-semibold text-base">{t('pages.setting.system-info.title')}</span>
                                <Badge variant="secondary" className="ml-2">{t('common.read-only')}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">{t('pages.setting.system-info.description')}</div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{t('pages.setting.system-info.storage-path')}</span>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">
                                        {config?.appPath || t('pages.setting.loading')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{t('pages.setting.system-info.version')}</span>
                                <Badge variant="outline">{config?.version || t('pages.setting.loading')}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('pages.setting.system-info.current-user')}</span>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">
                                        {user?.username || t('common.unknown')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 分割线 */}
                        <div className="my-2 border-t" />

                        {/* 存储设置 */}
                        <div>
                            <div className="flex items-center mb-2">
                                <Database className="h-5 w-5 mr-2 text-primary" />
                                <span className="font-semibold text-base">{t('pages.setting.storage.title')}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">{t('pages.setting.storage.description')}</div>
                            <div className="space-y-2">
                                <Label htmlFor="storage-path">{t('pages.setting.storage.path-label')}</Label>
                                <div className="flex items-center space-x-2">
                                    {editingField === 'storage' ? (
                                        <>
                                            <Input
                                                id="storage-path"
                                                placeholder={t('form.setting.storage.path.placeholder')}
                                                value={storagePathInput}
                                                onChange={(e) => setStoragePathInput(e.target.value)}
                                                disabled={processing}
                                                className="h-8 px-3 text-sm rounded-md"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={cancelEdit}
                                                disabled={processing}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleStoragePathSubmit}
                                                disabled={processing || !storagePathInput?.trim()}
                                            >
                                                {processing ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 p-3 bg-muted/50 rounded-md text-sm h-8 flex items-center">
                                                {storagePathInput}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingField('storage')}
                                                disabled={processing || editingField !== null}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{t('pages.setting.storage.alert')}</div>
                            </div>
                        </div>

                        {/* 分割线 */}
                        <div className="my-2 border-t" />

                        {/* 安全设置 */}
                        <div>
                            <div className="flex items-center mb-2">
                                <Shield className="h-5 w-5 mr-2 text-primary" />
                                <span className="font-semibold text-base">{t('pages.setting.security.title')}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">{t('pages.setting.security.description')}</div>
                            <div className="space-y-2">
                                <Label htmlFor="password">{t('pages.setting.security.password-label')}</Label>
                                <div className="flex items-center space-x-2">
                                    {editingField === 'password' ? (
                                        <>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder={t('form.setting.password.placeholder')}
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                                disabled={processing}
                                                className="h-8 px-3 text-sm rounded-md"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={cancelEdit}
                                                disabled={processing}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handlePasswordSubmit}
                                                disabled={processing || !passwordInput?.trim() || passwordInput === '******'}
                                            >
                                                {processing ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 p-3 bg-muted/50 rounded-md text-sm h-8 flex items-center">
                                                ••••••
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingField('password')}
                                                disabled={processing || editingField !== null}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{t('pages.setting.security.alert')}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

export default Setting
