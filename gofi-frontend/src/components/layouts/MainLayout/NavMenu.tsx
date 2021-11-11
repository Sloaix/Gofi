import React from 'react'
import { RiGithubFill, RiFolder3Line, RiSettings2Line, RiBook2Line } from '@hacknug/react-icons/ri'
import EnvUtil from '../../../utils/env.util'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

const menuItemUnderLineClass =
    'transition-all box-content h-full px-4 cursor-pointer flex items-center border-b-2 text-gray-600 hover:border-indigo-500 hover:text-indigo-500'
const activeClass = 'border-indigo-500 text-indigo-500'
const NavMenu: React.FC = () => {
    const location = useLocation()
    const { t } = useTranslation()

    const LINK_TO_FILE_VIEWER = '/file/viewer'
    const LINK_TO_ADMIN_SETTING = '/admin/setting'

    const isActive = (link: string) => {
        return location.pathname === link
    }

    const menuItemClasses = (link: string) => {
        return classNames(menuItemUnderLineClass, isActive(link) ? activeClass : 'border-transparent')
    }

    return (
        <div className="flex h-full">
            <Link to={LINK_TO_FILE_VIEWER} className={menuItemClasses(LINK_TO_FILE_VIEWER)}>
                <RiFolder3Line />
                <span className="px-2 text-sm hidden sm:block">{t('menu.file')}</span>
            </Link>
            <Link to={LINK_TO_ADMIN_SETTING} className={menuItemClasses(LINK_TO_ADMIN_SETTING)}>
                <RiSettings2Line />
                <span className="px-2 text-sm hidden sm:block">{t('menu.setting')}</span>
            </Link>
            {EnvUtil.isPreviewMode ? (
                <>
                    <a href="https://gofi.calmlyfish.com" target="_blank" className={menuItemClasses('')}>
                        <RiBook2Line />
                        <span className="px-2 text-sm hidden sm:block">{t('menu.doc')}</span>
                    </a>
                    <a href="https://github.com/Sloaix/Gofi" target="_blank" className={menuItemClasses('')}>
                        <RiGithubFill />
                        <span className="pl-2 pr-1 text-sm">{t('menu.stars')}</span>

                        {/* red dot notice start*/}
                        <span className="flex h-full w-1 pt-4">
                            <span className="relative inline-flex rounded-full h-1 w-1 bg-red-500"></span>
                        </span>
                        {/* red dot notice end*/}
                    </a>
                </>
            ) : null}
        </div>
    )
}

export default NavMenu
