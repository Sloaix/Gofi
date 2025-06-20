import { Home, Shield, LogIn } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'

const UnAuthorized: React.FC = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* 主要内容 */}
            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                {/* 大号403 */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-foreground leading-none">
                        403
                    </h1>
                </div>

                {/* 图标 */}
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-10 w-10 text-primary" />
                    </div>
                </div>

                {/* 标题和描述 */}
                <div className="mb-12 space-y-4">
                    <h2 className="text-3xl font-semibold text-foreground">
                        {t('pages.exception.403.title')}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                        {t('pages.exception.403.description')}
                    </p>
                </div>

                {/* 按钮组 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                        onClick={() => navigate('/')}
                        size="lg"
                        className="px-8"
                    >
                        <Home className="h-5 w-5 mr-2" />
                        {t('component.exception.back-home')}
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => navigate('/auth/login')}
                        size="lg"
                        className="px-8"
                    >
                        <LogIn className="h-5 w-5 mr-2" />
                        {t('component.exception.re-login')}
                    </Button>
                </div>
            </div>

            {/* 波浪背景 */}
            <div className="absolute bottom-0 left-0 w-full text-primary">
                <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
                    <defs>
                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g className="parallax">
                        <use xlinkHref="#gentle-wave" x="48" y="0" fill="currentColor" opacity="0.15" />
                        <use xlinkHref="#gentle-wave" x="48" y="3" fill="currentColor" opacity="0.1" />
                        <use xlinkHref="#gentle-wave" x="48" y="5" fill="currentColor" opacity="0.05" />
                        <use xlinkHref="#gentle-wave" x="48" y="7" fill="currentColor" opacity="0.2" />
                    </g>
                </svg>
            </div>

            <style>{`
                .waves {
                    position: relative;
                    width: 100%;
                    height: 15vh;
                    margin-bottom: -7px; /* Fix for safari gap */
                    min-height: 100px;
                    max-height: 150px;
                }

                .parallax > use {
                    animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
                }
                .parallax > use:nth-child(1) {
                    animation-delay: -2s;
                    animation-duration: 7s;
                }
                .parallax > use:nth-child(2) {
                    animation-delay: -3s;
                    animation-duration: 10s;
                }
                .parallax > use:nth-child(3) {
                    animation-delay: -4s;
                    animation-duration: 13s;
                }
                .parallax > use:nth-child(4) {
                    animation-delay: -5s;
                    animation-duration: 20s;
                }

                @keyframes move-forever {
                    0% {
                        transform: translate3d(-90px,0,0);
                    }
                    100% { 
                        transform: translate3d(85px,0,0);
                    }
                }
            `}</style>
        </div>
    )
}

export default UnAuthorized
