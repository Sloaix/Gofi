import React from 'react'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.svg'

interface IProps {}

const defualtProps: IProps = {}

const PageLoading: React.FC<IProps> = (props) => {
    const { t } = useTranslation()
    return (
        <>
            <div className="animate-fadein p-2 bg-background/80 backdrop-blur-sm w-full h-full flex flex-col items-center justify-center">
                <div className="flex flex-col items-center space-y-8 max-w-sm mx-auto">
                    {/* Pixel风格Logo动画 */}
                    <div className="flex flex-col items-center space-y-4">
                        <img 
                            src={logo} 
                            className="w-16 md:w-20 drop-shadow-sm pixelate animate-bounce-pixel"
                            alt="Logo"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    {/* Loading文字 */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="text-center animate-pulse-slow">
                            <span className="text-base md:text-lg font-medium text-foreground/80 tracking-wide">
                                {t('pages.loading.title')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

PageLoading

export default PageLoading
