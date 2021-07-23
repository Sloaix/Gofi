import {
    RiAlarmWarningFill,
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiInformationFill,
    RiLoader5Line,
} from '@hacknug/react-icons/ri'
import React from 'react'
import { toast as ToastLibrary } from 'react-toastify'

type MessageType = 'info' | 'success' | 'error' | 'warn' | 'load'
const Toast = {
    show(message: string | React.ReactNode, autoClose: false | number) {
        ToastLibrary(message, {
            autoClose: autoClose,
            draggable: false,
            closeButton: false,
            hideProgressBar: true,
            position: 'top-center',
        })
    },
    i(message: string) {
        this.show(this.renderMessage(message, 'info'), 2000)
    },
    s(message: string) {
        this.show(this.renderMessage(message, 'success'), 2000)
    },
    e(message: string) {
        this.show(this.renderMessage(message, 'error'), 2000)
    },
    w(message: string) {
        this.show(this.renderMessage(message, 'warn'), 2000)
    },
    l(message: string) {
        this.show(this.renderMessage(message, 'load'), 2000)
    },
    renderMessage(message: string, messageType: MessageType): React.ReactNode | string {
        let icon
        let iconClass
        switch (messageType) {
            case 'info':
                icon = <RiInformationFill />
                iconClass = 'text-indigo-500'
                break
            case 'success':
                icon = <RiCheckboxCircleFill />
                iconClass = 'text-green-500'
                break
            case 'error':
                icon = <RiCloseCircleFill />
                iconClass = 'text-red-500'
                break
            case 'warn':
                icon = <RiAlarmWarningFill />
                iconClass = 'text-yellow-500'
                break
            case 'load':
                icon = <RiLoader5Line />
                iconClass = 'text-blue-500 animate-spin'
                break
        }
        return (
            <div className="flex items-center space-x-1">
                <span className={iconClass}>{icon}</span>
                <span className="text-gray-700">{message}</span>
            </div>
        )
    },
}

export default Toast
