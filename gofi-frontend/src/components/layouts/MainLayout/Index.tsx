import { observer } from 'mobx-react-lite'
import React from 'react'
import { useStore } from '../../../stores'
import Footer from '../../Footer'
import LangSelect from './LangSelect'
import LoginStatus from './LoginStatus'
import Logo from './Logo'
import NavMenu from './NavMenu'

const MainLayout: React.FC = (props) => {
    const { appStore } = useStore()

    return (
        <div className="bg-gray-100 h-full w-full flex flex-col overflow-x-hidden">
            <nav className="bg-white h-12 w-screen shadow">
                <div className="w-full h-full max-w-5xl mx-auto flex flex-row items-center p-4 sm:p-0">
                    <Logo />
                    <div className="flex-grow h-full">
                        <NavMenu />
                    </div>
                    <LoginStatus />
                    <LangSelect
                        selectLang={appStore.lang}
                        onSelect={(lang: string) => {
                            appStore.changeLanguage(lang)
                        }}
                    />
                </div>
            </nav>
            <div className="flex-grow w-full max-w-5xl mx-auto py-4 p-4 sm:p-0">{props.children}</div>
            <Footer />
        </div>
    )
}

export default observer(MainLayout)
