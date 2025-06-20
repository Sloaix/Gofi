import React, { useEffect, useState } from 'react'
import { RiWifiLine, RiWifiOffLine, RiRefreshLine } from 'react-icons/ri'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import Toast from '../utils/toast.util'
import i18n from '../i18n'

interface NetworkStatusProps {
    className?: string
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [isChecking, setIsChecking] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            Toast.s('网络连接已恢复')
        }

        const handleOffline = () => {
            setIsOnline(false)
            Toast.networkError('网络连接已断开', '请检查网络设置')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const handleRetry = async () => {
        setIsChecking(true)
        try {
            // 尝试访问一个简单的资源来测试网络连接
            await fetch('/api/health', { 
                method: 'HEAD',
                cache: 'no-cache'
            })
            setIsOnline(true)
            Toast.s('网络连接正常')
        } catch (error) {
            setIsOnline(false)
            Toast.networkError('网络连接失败', '请检查网络设置或稍后重试')
        } finally {
            setIsChecking(false)
        }
    }

    if (isOnline) {
        return null // 在线时隐藏组件
    }

    return (
        <div className={`fixed top-4 right-4 z-50 ${className}`}>
            <div className="bg-destructive/90 backdrop-blur-sm border border-destructive/20 rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                    <RiWifiOffLine className="text-white h-4 w-4" />
                    <span className="text-white text-sm font-medium">
                        网络连接异常
                    </span>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRetry}
                        disabled={isChecking}
                        className="text-white hover:text-white hover:bg-white/20 h-6 px-2"
                    >
                        {isChecking ? (
                            <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                        ) : (
                            <RiRefreshLine className="h-3 w-3" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default NetworkStatus 