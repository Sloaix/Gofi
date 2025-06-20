import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LogoLoading from './LogoLoading'

const LoadingSpinnerDemo: React.FC = () => {
    const { t } = useTranslation()
    const variants = ['spinner', 'dots', 'pulse', 'bars'] as const
    const sizes = ['sm', 'md', 'lg', 'xl'] as const

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">{t('component.loading-spinner-demo.title')}</h2>
                <p className="text-muted-foreground mb-6">
                    {t('component.loading-spinner-demo.description')}
                </p>
            </div>

            {/* 变体演示 */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">{t('component.loading-spinner-demo.variants.title')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {variants.map((variant) => (
                        <div key={variant} className="text-center space-y-4">
                            <div className="bg-card border border-border rounded-lg p-6">
                                <LogoLoading className="mb-4" />
                                <div className="text-center mt-2">
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {t('common.loading')}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm font-medium capitalize">
                                {variant}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 尺寸演示 */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">{t('component.loading-spinner-demo.sizes.title')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {sizes.map((size) => (
                        <div key={size} className="text-center space-y-4">
                            <div className="bg-card border border-border rounded-lg p-6">
                                <LogoLoading className="mb-4" />
                                <div className="text-center mt-2">
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {t('common.loading')}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm font-medium uppercase">
                                {size}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 实际使用场景 */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">{t('component.loading-spinner-demo.use-cases.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 页面加载 */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h4 className="font-medium mb-4">{t('component.loading-spinner-demo.use-cases.page-loading')}</h4>
                        <LogoLoading className="mb-4" />
                        <div className="text-center mt-2">
                            <span className="text-sm text-muted-foreground font-medium">
                                {t('common.loading')}
                            </span>
                        </div>
                    </div>

                    {/* 内容加载 */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h4 className="font-medium mb-4">{t('component.loading-spinner-demo.use-cases.content-loading')}</h4>
                        <LogoLoading className="mb-4" />
                        <div className="text-center mt-2">
                            <span className="text-sm text-muted-foreground font-medium">
                                {t('common.loading')}
                            </span>
                        </div>
                    </div>

                    {/* 按钮加载 */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h4 className="font-medium mb-4">{t('component.loading-spinner-demo.use-cases.button-loading')}</h4>
                        <LogoLoading className="mb-4" />
                        <div className="text-center mt-2">
                            <span className="text-sm text-muted-foreground font-medium">
                                {t('common.loading')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingSpinnerDemo 