import React from 'react'
import { RiTranslate2 } from '@hacknug/react-icons/ri'
import zhCN from '../../../assets/zh-CN.svg'
import enUS from '../../../assets/en-US.svg'
import classNames from 'classnames'

interface IProps {
    selectLang?: string
    onSelect?: (lang: string) => void
}

const defualtProps: IProps = {
    selectLang: 'zh-CN',
}

const LangSelect: React.FC<IProps> = (props) => {
    const [visible, setVisible] = React.useState<boolean>(false)

    const renderDropdownMenu = () => {
        const menuItemClass =
            'flex items-center transition-all block p-2 text-sm leading-none hover:text-indigo-500 hover:bg-gray-200 active:bg-gray-300 active:text-indigo-900'
        const flagClass = 'v-5 h-5 mb-[0.15rem]'
        const menuContainerClass =
            'divide-y divide-gray-200 z-10 cursor-pointer animate-fadein origin-top-right absolute right-0 w-36 rounded shadow-lg bg-white border border-gray-200'
        const menuItemSelectClass = 'bg-gray-200 text-indigo-500 font-bold'

        if (visible) {
            const languages = [
                {
                    lang: 'zh-CN',
                    flag: zhCN,
                    label: '简体中文',
                },
                {
                    lang: 'en-US',
                    flag: enUS,
                    label: 'English',
                },
            ]
            const menus = languages.map((item, index) => {
                return (
                    <div
                        key={index}
                        className={classNames(
                            menuItemClass,
                            { 'text-gray-700': props.selectLang !== item.lang },
                            { [menuItemSelectClass]: props.selectLang === item.lang },
                        )}
                        onClick={() => {
                            if (props.onSelect) {
                                props.onSelect(item.lang)
                            }
                        }}
                    >
                        <img src={item.flag} className={flagClass} />
                        <span className="ml-3">{item.label}</span>
                    </div>
                )
            })

            return <div className={menuContainerClass}>{menus}</div>
        } else {
            return null
        }
    }

    return (
        <>
            <div
                onMouseEnter={() => {
                    setVisible(true)
                }}
                onMouseLeave={() => {
                    setVisible(false)
                }}
                className="transition-all relative inline-block text-left h-full text-gray-600 hover:border-indigo-500 hover:text-indigo-500"
            >
                <div className="h-full pl-6 text-black-500 cursor-pointer flex items-center">
                    <RiTranslate2 size={20} />
                </div>

                {renderDropdownMenu()}
            </div>
        </>
    )
}

LangSelect.defaultProps = defualtProps

export default LangSelect
