import { RiLoginBoxLine, RiLogoutBoxRLine } from '@hacknug/react-icons/ri'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { useSWRConfig } from 'swr'
import { TOKEN } from '../../../constants/storage'
import QueryKey from '../../../constants/swr'
import { useCurrentUser } from '../../../hook/user'
import i18n from '../../../i18n'
import { tokenState } from '../../../states/common.state'
import Toast from '../../../utils/toast.util'
interface IProps {}

const buttonClass =
    'transition-all box-content h-full px-4 text-black-500 cursor-pointer flex items-center border-b-2 border-transparent text-gray-600 hover:text-indigo-500'
const textClass = 'px-2 text-sm hidden sm:block'

const LoginStatus: React.FC<IProps> = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useCurrentUser()
    const setToken = useSetRecoilState(tokenState)
    const { mutate } = useSWRConfig()
    return (
        <div className="flex h-full">
            {user ? (
                <div
                    className={buttonClass}
                    onClick={() => {
                        setToken(null)
                        sessionStorage.removeItem(TOKEN)
                        Toast.i(i18n.t('toast.logout-success'))
                        mutate(QueryKey.CURRENT_USER)
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

export default LoginStatus
