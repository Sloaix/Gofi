import { RiLoginBoxLine, RiLogoutBoxRLine } from '@hacknug/react-icons/ri'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../../stores'

interface IProps {}

const buttonClass =
    'transition-all box-content h-full px-4 text-black-500 cursor-pointer flex items-center border-b-2 border-transparent text-gray-600 hover:text-indigo-500'
const textClass = 'px-2 text-sm hidden sm:block'

const LoginStatus: React.FC<IProps> = () => {
    const { userStore } = useStore()
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className="flex h-full">
            {userStore.isLogin ? (
                <div
                    className={buttonClass}
                    onClick={() => {
                        userStore.logout()
                        navigate('/')
                    }}
                >
                    <RiLogoutBoxRLine />
                    <span className={textClass}>{t('menu.logout')}</span>
                </div>
            ) : (
                <Link to="/auth/login" className={buttonClass}>
                    <RiLoginBoxLine />
                    <div className={textClass}>{t('menu.login')}</div>
                </Link>
            )}
        </div>
    )
}

export default observer(LoginStatus)
