import { RiSunLine, RiMoonLine, RiComputerLine } from 'react-icons/ri'
import { cn } from '../../../lib/utils'
import React, { useEffect } from 'react'
import { useAtom } from 'jotai'
import { themeState, ThemeMode } from '../../../states/common.state'
import { THEME } from '../../../constants/storage'
import { useTranslation } from 'react-i18next'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu'

interface IProps {}

const ThemeSelect: React.FC<IProps> = () => {
    const [theme, setTheme] = useAtom(themeState)
    const { t } = useTranslation()

    const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
        {
            value: 'light',
            label: t('component.theme.light'),
            icon: <RiSunLine size={20} />,
        },
        {
            value: 'dark',
            label: t('component.theme.dark'),
            icon: <RiMoonLine size={20} />,
        },
        {
            value: 'system',
            label: t('component.theme.system'),
            icon: <RiComputerLine size={20} />,
        },
    ]

    // 应用主题到文档
    const applyTheme = (themeMode: ThemeMode) => {
        const root = document.documentElement
        
        if (themeMode === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            root.classList.toggle('dark', systemTheme === 'dark')
        } else {
            root.classList.toggle('dark', themeMode === 'dark')
        }
    }

    // 监听系统主题变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system')
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    // 初始化主题
    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    const handleThemeChange = (newTheme: ThemeMode) => {
        setTheme(newTheme)
        localStorage.setItem(THEME, newTheme)
        applyTheme(newTheme)
    }

    const currentTheme = themes.find(t => t.value === theme)

    return (
        <div className="flex h-full">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="transition-all box-content h-full px-2 text-black-500 cursor-pointer flex items-center border-b-2 border-transparent text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary focus:outline-none">
                        {currentTheme?.icon}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                    {themes.map((item, index) => (
                        <DropdownMenuItem
                            key={index}
                            className={cn(
                                "cursor-pointer flex items-center",
                                theme === item.value && "bg-accent text-accent-foreground font-medium"
                            )}
                            onClick={() => handleThemeChange(item.value)}
                        >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default ThemeSelect 