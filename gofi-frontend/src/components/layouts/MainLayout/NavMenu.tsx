import React from 'react'
import { RiGithubFill, RiFolder3Line, RiSettings2Line, RiBook2Line } from 'react-icons/ri'
import { Folder, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import EnvUtil from '../../../utils/env.util'
import classNames from 'classnames'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu'

const navItems = [
  { key: 'file', label: 'menu.file', to: '/file' },
  { key: 'setting', icon: <RiSettings2Line size={20} />, label: 'menu.setting', to: '/admin/setting' },
]

const moreItems = [
  { key: 'doc', icon: <RiBook2Line size={20} className="mr-2" />, label: 'menu.doc', href: 'https://gofi.calmlyfish.com', show: EnvUtil.isPreviewMode },
  { key: 'stars', icon: <RiGithubFill size={20} className="mr-2" />, label: 'menu.stars', href: 'https://github.com/Sloaix/Gofi', show: EnvUtil.isPreviewMode },
]

const NavMenu: React.FC = () => {
  const location = useLocation()
  const { t } = useTranslation()
  const isActive = (link: string) => location.pathname === link

  return (
    <nav className="flex h-full items-center gap-2 px-2">
      {navItems.map(item => {
        const active = isActive(item.to)
        let icon = item.icon
        if (item.key === 'file') {
          icon = active
            ? <FolderOpen size={20} className="text-primary" />
            : <Folder size={20} className="text-muted-foreground" />
        }
        return (
          <Link
            key={item.key}
            to={item.to}
            className={classNames(
              'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
              active
                ? 'text-primary font-semibold bg-primary/5'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            )}
          >
            {icon}
            <span className="hidden sm:inline text-sm">{t(item.label)}</span>
          </Link>
        )
      })}
      {/* 移动端更多菜单 */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5">
              <RiBook2Line size={20} />
              <span className="sr-only">{t('menu.more')}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {moreItems.filter(i => i.show).map(item => (
              <DropdownMenuItem asChild key={item.key}>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  {item.icon}
                  <span className="text-sm">{t(item.label)}</span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* 桌面端更多菜单 */}
      {moreItems.filter(i => i.show).map(item => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5"
        >
          {item.icon}
          <span className="text-sm">{t(item.label)}</span>
        </a>
      ))}
    </nav>
  )
}

export default NavMenu
