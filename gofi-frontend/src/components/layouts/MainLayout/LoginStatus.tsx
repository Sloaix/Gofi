import React, { useEffect } from 'react'
import { RiLogoutBoxRLine, RiLoginBoxLine } from '@hacknug/react-icons/ri'
import { Link } from '@reach/router'
import { useStore } from '../../../stores'
import { observer } from 'mobx-react-lite'

interface IProps {}

const buttonClass =
    'transition-all box-content h-full px-4 text-black-500 cursor-pointer flex items-center border-b-2 border-transparent text-gray-600 hover:text-indigo-500'
const textClass = 'px-2 text-sm hidden sm:block'

const LoginStatus: React.FC<IProps> = () => {
    const { userStore } = useStore()

    return (
        <div className="flex h-full">
            {userStore.isLogin ? (
                <div
                    className={buttonClass}
                    onClick={() => {
                        userStore.logout()
                    }}
                >
                    <RiLogoutBoxRLine />
                    <span className={textClass}>退出</span>
                </div>
            ) : (
                <Link to="/auth/login" className={buttonClass}>
                    <RiLoginBoxLine />
                    <div className={textClass}>登录</div>
                </Link>
            )}
        </div>
    )
}

export default observer(LoginStatus)
