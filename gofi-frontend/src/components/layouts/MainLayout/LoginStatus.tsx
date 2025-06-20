import { RiLoginBoxLine, RiLogoutBoxRLine } from 'react-icons/ri'
import { useSetAtom } from 'jotai'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'
import { TOKEN } from '../../../constants/storage'
import QueryKey from '../../../constants/swr'
import { useCurrentUser } from '../../../hook/user'
import { tokenState } from '../../../states/common.state'

interface IProps {}

const buttonClass =
    'transition-all box-content h-full px-4 text-black-500 cursor-pointer flex items-center border-b-2 border-transparent text-gray-600 hover:text-indigo-500'
const textClass = 'ml-2 text-sm hidden sm:block'

const LoginStatus: React.FC<IProps> = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useCurrentUser()
    const setToken = useSetAtom(tokenState)
    const { mutate } = useSWRConfig()
    return (
        <div className="flex h-full">
            {user ? (
                <div
                    className={buttonClass}
                    onClick={() => {
                        console.log(`[${new Date().toISOString()}] [LoginStatus] Logout button clicked.`)
                        // Clear token state
                        console.log(`[${new Date().toISOString()}] [LoginStatus] Clearing token state.`)
                        setToken(null)
                        // Clear session storage
                        console.log(`[${new Date().toISOString()}] [LoginStatus] Clearing session storage.`)
                        sessionStorage.removeItem(TOKEN)
                        // Dismiss the "require-login" toast if it's visible
                        console.log(`[${new Date().toISOString()}] [LoginStatus] Dismissing 'require-login' toast.`)
                        toast.dismiss('require-login')
                        // Show logout success toast
                        console.log(`[${new Date().toISOString()}] [LoginStatus] Showing 'logout-success' toast.`)
                        toast.success(t('toast.logout-success'))
                        // Revalidate SWR cache
                        console.log(`[${new Date().toISOString()}] [LoginStatus] Revalidating user cache.`)
                        mutate(QueryKey.CURRENT_USER)
                        // Navigate to home page
                        console.log(`[${new Date().toISOString()}] [LoginStatus] Navigating to home page.`)
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
