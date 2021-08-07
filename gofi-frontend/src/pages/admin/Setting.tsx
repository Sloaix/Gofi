import { MdCheck, MdClose, MdEdit } from '@hacknug/react-icons/md'
import { RiSettings2Line } from '@hacknug/react-icons/ri'
import { RouteComponentProps } from '@reach/router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import repo from '../../api/repository'
import Button from '../../components/Button'
import Input from '../../components/form/Input'
import MainLayout from '../../components/layouts/MainLayout/Index'
import PageHeader from '../../components/PageHeader'
import { useStore } from '../../stores'
import TextUtil from '../../utils/text.util'
import Toast from '../../utils/toast.util'

interface IProps extends RouteComponentProps {}

const defualtProps: IProps = {}

const Setting: React.FC<IProps> = (props) => {
    const { appStore, userStore } = useStore()
    const [isFormMode, setIsFormMode] = useState<boolean>(false)
    const [password, setPassowrd] = useState<string>('******')
    const { t } = useTranslation()

    useEffect(() => {
        if (isFormMode) {
            setPassowrd('')
        } else {
            setPassowrd('******')
        }
    }, [isFormMode])

    const onUpdatePasswordClicked = async () => {
        if (TextUtil.isEmpty(password)) {
            Toast.e('新密码不能为空')
            return
        }

        try {
            await repo.changePassword({ password: password, confirm: password })
            setIsFormMode(!isFormMode)
            Toast.s('密码修改成功')
        } catch (error) {
            console.log(error)
            // Toast.e(`密码修改失败${error}`)
        }
    }

    const itemClasses = 'bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'
    const itemTitleClasses = 'text-sm font-medium text-gray-500'
    const itemFieldClasses = 'mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'

    return (
        <MainLayout>
            <PageHeader title="设置" icon={<RiSettings2Line />} />
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-md leading-6 font-medium text-gray-900">Gofi相关配置</h3>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>{t('pages.admin.setting.label.storage-path')}</dt>
                            <dd className={itemFieldClasses}>
                                {appStore.config?.customStoragePath
                                    ? appStore.config?.customStoragePath
                                    : appStore.config?.defaultStoragePath}
                            </dd>
                        </div>

                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>{t('pages.admin.setting.label.gofi-workdir')}</dt>
                            <dd className={itemFieldClasses}>{appStore.config?.appPath}</dd>
                        </div>
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>{t('pages.admin.setting.label.version')}</dt>
                            <dd className={itemFieldClasses}>{appStore.config?.version}</dd>
                        </div>
                        {/* <div className={itemClasses}>
                            <dt className={itemTitleClasses}>用户类型</dt>
                            <dd className={itemFieldClasses}>{FormatUtil.formatUserType(userStore.user?.roleType)}</dd>
                        </div> */}
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>{t('pages.admin.setting.label.username')}</dt>
                            <dd className={itemFieldClasses}>{userStore.user?.username}</dd>
                        </div>
                        <div className={itemClasses}>
                            <dt className={itemTitleClasses}>{t('pages.admin.setting.label.password')}</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex space-x-2">
                                <Input
                                    disable={!isFormMode}
                                    value={password}
                                    placeholder={t('pages.admin.setting.form.input.password.placeholder')}
                                    type={isFormMode ? 'input' : 'password'}
                                    onChange={(e) => {
                                        setPassowrd(e.target.value)
                                    }}
                                />
                                {isFormMode ? (
                                    <div className="animate-fadein">
                                        <Button
                                            icon={<MdClose />}
                                            onClick={() => {
                                                setIsFormMode(false)
                                            }}
                                        />
                                    </div>
                                ) : null}
                                <Button
                                    icon={isFormMode ? <MdCheck /> : <MdEdit />}
                                    disabled={(() => {
                                        if (!isFormMode) {
                                            return false
                                        } else {
                                        }
                                    })()}
                                    onClick={() => {
                                        if (!isFormMode) {
                                            setIsFormMode(true)
                                            return
                                        }
                                        onUpdatePasswordClicked()
                                    }}
                                ></Button>
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