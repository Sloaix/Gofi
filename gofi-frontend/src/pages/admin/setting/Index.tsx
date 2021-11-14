import {
    RiComputerLine,
    RiDatabase2Line,
    RiDoorLockLine,
    RiSettings2Line,
    RiShieldUserLine,
} from '@hacknug/react-icons/ri'
import classNames from 'classnames'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSWR, { useSWRConfig } from 'swr'
import { changePassword, fetchConfiguration, updateStoragePath } from '../../../api/repository'
import logo from '../../../assets/logo.svg'
import MainLayout from '../../../components/layouts/MainLayout/Index'
import PageHeader from '../../../components/PageHeader'
import QueryKey from '../../../constants/swr'
import { useCurrentUser } from '../../../hook/user'
import Toast from '../../../utils/toast.util'
import InputField from './InputField'

interface IProps {}

const defualtProps: IProps = {}

const Setting: React.FC<IProps> = (props) => {
    const [processing, setProcessing] = useState(false)
    const [storagePathInput, setStoragePathInput] = useState<string>()
    const [currentStoragePath, setCurrentStoragePath] = useState<string>()
    const [passwordInput, setPasswordInput] = useState<string>('******')
    const { t } = useTranslation()
    const { user } = useCurrentUser()
    const { data: config } = useSWR(QueryKey.CONFIG, () => fetchConfiguration())

    useEffect(() => {
        if (config) {
            if (_.isEmpty(config.customStoragePath)) {
                setCurrentStoragePath(config.defaultStoragePath)
            } else {
                setCurrentStoragePath(config.customStoragePath)
            }
        }
    }, [config])

    useEffect(() => {
        if (currentStoragePath) {
            setStoragePathInput(currentStoragePath)
        }
    }, [currentStoragePath])

    const { mutate } = useSWRConfig()

    // 修改文件仓库路径
    const mutateStoragePath = async (resetState: () => void) => {
        if (!storagePathInput) {
            Toast.e(t('storage.path.empty'))
            return
        }

        try {
            setProcessing(true)

            await updateStoragePath(storagePathInput)
            mutate(QueryKey.CONFIG)
            // 重置input的状态为默认状态
            resetState()
            Toast.s(t('toast.storage-change-success'))
        } finally {
            setProcessing(false)
        }
    }

    // 修改密码
    const mutatePassword = async (resetState: () => void) => {
        try {
            setProcessing(true)
            await changePassword({ password: passwordInput, confirm: passwordInput })
            // 重置input的状态为默认状态
            resetState()
            // 显示脱敏的密码
            setPasswordInput('******')
            Toast.s(t('toast.password-change-success'))
        } finally {
            setProcessing(false)
        }
    }

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
                                    value={storagePathInput}
                                    defaultValue={currentStoragePath}
                                    processing={processing}
                                    onSubmit={mutateStoragePath}
                                    onChange={(value: string) => {
                                        setStoragePathInput(value)
                                    }}
                                    onClose={() => {
                                        // 还原为默认值
                                        setStoragePathInput(currentStoragePath)
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
                            <dd className={itemFieldClasses}>{config?.appPath}</dd>
                        </div>
                        {/* 版本 */}
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>
                                <img src={logo} className="h-3" />
                                <span>{t('pages.admin.setting.label.version')}</span>
                            </dt>
                            <dd className={itemFieldClasses}>{config?.version}</dd>
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
                                    value={passwordInput}
                                    defaultValue=""
                                    processing={processing}
                                    placeholder={t('pages.admin.setting.form.input.password.placeholder')}
                                    onSubmit={mutatePassword}
                                    onChange={(value: string) => {
                                        setPasswordInput(value)
                                    }}
                                    onEdit={() => {
                                        setPasswordInput('')
                                    }}
                                    onClose={() => {
                                        // 还原为默认值
                                        setPasswordInput('******')
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

export default Setting
