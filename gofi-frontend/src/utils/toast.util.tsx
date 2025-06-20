import {
    RiAlarmWarningFill,
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiInformationFill,
    RiLoader5Line,
    RiWifiOffLine,
    RiServerLine,
    RiTimeLine,
} from 'react-icons/ri'
import React from 'react'
import { toast as SonnerToast } from 'sonner'

type MessageType = 'info' | 'success' | 'error' | 'warn' | 'load' | 'network-error' | 'server-error' | 'timeout-error'

const Toast = {
    i(message: string) {
        SonnerToast.info(message, {
            duration: 2000,
            icon: <RiInformationFill className="text-primary" />,
        })
    },
    s(message: string) {
        SonnerToast.success(message, {
            duration: 2000,
            icon: <RiCheckboxCircleFill className="text-green-500" />,
        })
    },
    e(message: string) {
        SonnerToast.error(message, {
            duration: 4000,
            icon: <RiCloseCircleFill className="text-destructive" />,
        })
    },
    w(message: string) {
        SonnerToast.warning(message, {
            duration: 3000,
            icon: <RiAlarmWarningFill className="text-yellow-500" />,
        })
    },
    l(message: string) {
        SonnerToast.loading(message, {
            duration: 2000,
            icon: <RiLoader5Line className="text-primary animate-spin" />,
        })
    },
    // 网络错误专用方法
    networkError(message: string, detail?: string) {
        SonnerToast.error(
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <RiWifiOffLine className="flex-shrink-0 text-destructive" />
                    <span className="text-sm font-medium">{message}</span>
                </div>
                {detail && (
                    <div className="text-xs text-muted-foreground ml-6">
                        {detail}
                    </div>
                )}
            </div>,
            {
                duration: 5000,
            }
        )
    },
    serverError(message: string, detail?: string) {
        SonnerToast.error(
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <RiServerLine className="flex-shrink-0 text-destructive" />
                    <span className="text-sm font-medium">{message}</span>
                </div>
                {detail && (
                    <div className="text-xs text-muted-foreground ml-6">
                        {detail}
                    </div>
                )}
            </div>,
            {
                duration: 5000,
            }
        )
    },
    timeoutError(message: string, detail?: string) {
        SonnerToast.error(
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <RiTimeLine className="flex-shrink-0 text-orange-500" />
                    <span className="text-sm font-medium">{message}</span>
                </div>
                {detail && (
                    <div className="text-xs text-muted-foreground ml-6">
                        {detail}
                    </div>
                )}
            </div>,
            {
                duration: 4000,
            }
        )
    },
}

export default Toast
