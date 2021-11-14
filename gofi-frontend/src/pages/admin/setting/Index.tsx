import {
    RiComputerLine,
    RiDatabase2Line,
    RiDoorLockLine,
    RiSettings2Line,
    RiShieldUserLine,
} from '@hacknug/react-icons/ri'
import classNames from 'classnames'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import repo from '../../../api/repository'
import logo from '../../../assets/logo.svg'
import MainLayout from '../../../components/layouts/MainLayout/Index'
import PageHeader from '../../../components/PageHeader'
import { useCurrentUser } from '../../../hook/user'
import { useStore } from '../../../stores'
import Toast from '../../../utils/toast.util'
import InputField from './InputField'

interface IProps {}

const defualtProps: IProps = {}

const Setting: React.FC<IProps> = (props) => {
    const { appStore } = useStore()
    const { t } = useTranslation()
    const { user } = useCurrentUser()

    // 存储storage input相关的状态
    const storageStore = useLocalObservable(() => ({
        defaultValue: '',
        inputValue: '',
        submitting: false,
        setDefaultValue(value: string) {
            this.defaultValue = value
        },
        setInputValue(value: string) {
            this.inputValue = value
        },
        setSubmitting(value: boolean) {
            this.submitting = value
        },
        async changeStorage(resetState: () => void) {
            try {
                // 显示loading
                this.setSubmitting(true)
                // 延迟1秒，让loading动画更流畅
                setTimeout(async () => {
                    const success = await appStore.updateStoragePath(this.inputValue)
                    // 关闭loading
                    this.setSubmitting(false)
                    if (success) {
                        // 重置input的状态为默认状态
                        resetState()

                        Toast.s(t('toast.storage-change-success'))
                    }
                }, 1000)
            } catch (error) {
                this.setSubmitting(false)
            }
        },
    }))

    // 存储password 表单的状态
    const passwordStore = useLocalObservable(() => ({
        inputValue: '******',
        submitting: false,
        setInputValue(value: string) {
            this.inputValue = value
        },
        setSubmitting(value: boolean) {
            this.submitting = value
        },
        async changePassword(resetState: () => void) {
            try {
                // 显示loading
                this.setSubmitting(true)
                //延迟1秒，让loading动画更流畅
                setTimeout(async () => {
                    await repo.changePassword({ password: this.inputValue, confirm: this.inputValue })
                    // 关闭loading
                    this.setSubmitting(false)
                    // 重置input的状态为默认状态
                    resetState()
                    // 显示脱敏的密码
                    passwordStore.setInputValue('******')
                    Toast.s(t('toast.password-change-success'))
                }, 1000)
            } catch (error) {
                this.setSubmitting(false)
            }
        },
    }))

    useEffect(() => {
        const storage = appStore.config?.customStoragePath
            ? appStore.config?.customStoragePath
            : appStore.config?.defaultStoragePath ?? ''
        storageStore.setDefaultValue(storage)
        storageStore.setInputValue(storage)
    }, [appStore.config])

    const itemClasses = 'bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'
    const itemTitleClasses = 'text-sm font-medium text-gray-500 flex items-center space-x-1'
    const itemFieldClasses = 'mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'

    return (
        <MainLayout>
            <PageHeader title={t('pages.admin.setting.title')} icon={<RiSettings2Line />} />
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-md leading-6 font-medium text-gray-900">
                        {t('pages.admin.setting.sub-title')}
                    </h3>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        {/* 仓库路径 */}
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>
                                <RiDatabase2Line /> <span>{t('pages.admin.setting.label.storage-path')}</span>
                            </dt>
                            <dd className={classNames(itemFieldClasses, 'flex space-x-2')}>
                                <InputField
                                    value={storageStore.inputValue}
                                    defaultValue={storageStore.defaultValue}
                                    submiting={storageStore.submitting}
                                    onSubmit={storageStore.changeStorage}
                                    onChange={(value: string) => {
                                        storageStore.setInputValue(value)
                                    }}
                                    onClose={() => {
                                        // 还原为默认值
                                        storageStore.setInputValue(storageStore.defaultValue)
                                    }}
                                />
                            </dd>
                        </div>

                        {/* 工作目录 */}
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>
                                <RiComputerLine />
                                <span> {t('pages.admin.setting.label.gofi-workdir')}</span>
                            </dt>
                            <dd className={itemFieldClasses}>{appStore.config?.appPath}</dd>
                        </div>
                        {/* 版本 */}
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>
                                <img src={logo} className="h-3" />
                                <span>{t('pages.admin.setting.label.version')}</span>
                            </dt>
                            <dd className={itemFieldClasses}>{appStore.config?.version}</dd>
                        </div>
                        {/* 用户名 */}
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>
                                <RiShieldUserLine />
                                <span>{t('pages.admin.setting.label.username')}</span>
                            </dt>
                            <dd className={itemFieldClasses}>{user?.username}</dd>
                        </div>
                        {/* 密码 */}
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>
                                <RiDoorLockLine />
                                <span>{t('pages.admin.setting.label.password')}</span>
                            </dt>

                            <dd className={classNames(itemFieldClasses, 'flex space-x-2')}>
                                <InputField
                                    value={passwordStore.inputValue}
                                    defaultValue=""
                                    submiting={passwordStore.submitting}
                                    placeholder={t('pages.admin.setting.form.input.password.placeholder')}
                                    onSubmit={passwordStore.changePassword}
                                    onChange={(value: string) => {
                                        passwordStore.setInputValue(value)
                                    }}
                                    onEdit={() => {
                                        passwordStore.setInputValue('')
                                    }}
                                    onClose={() => {
                                        // 还原为默认值
                                        passwordStore.setInputValue('******')
                                    }}
                                />
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </MainLayout>
    )
}

Setting.defaultProps = defualtProps

export default observer(Setting)
