import { RiLoader2Fill } from '@hacknug/react-icons/ri'
import classNames from 'classnames'
import React from 'react'

type ButtonType = 'primary' | 'secondary' | 'danger'

interface IProps {
    type?: ButtonType // 按钮默认类型
    fullWidth?: boolean // 是否充满宽度
    disabled?: boolean // 是否不可用
    loading?: boolean // 是否加载状态
    icon?: React.ReactNode // 渲染的icon
    ghost?: boolean
    circle?: boolean
    onClick?: () => void
}

// 默认值
const defaultProps: IProps = {
    type: 'primary',
    fullWidth: false,
    disabled: false,
    loading: false,
    icon: undefined,
}

const Button: React.FC<IProps> = (props) => {
    const onlyHasIcon = !props.children && (props.loading || props.icon)

    const buttonClass = {
        base: classNames(
            'h-8 select-none whitespace-nowrap space-x-2 transition-all flex items-center justify-center text-base',
            onlyHasIcon || props.circle ? 'w-8' : 'px-4 py2',
            props.circle ? 'rounded-full' : 'rounded-sm',
            props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            props.ghost ? null : classNames('shadow', props.disabled ? null : 'hover:shadow-lg'),
        ),
        primary: classNames(
            'active:bg-gray-200',
            props.ghost
                ? 'text-indigo-500 bg-white hover:bg-gray-100'
                : 'text-white bg-indigo-500 border border-indigo-500 hover:bg-white hover:text-indigo-500',
        ),
        secondary: classNames(
            'active:bg-gray-200',
            props.ghost
                ? 'text-gray-500 bg-white hover:bg-gray-100'
                : 'text-indigo-500 bg-white border border-gary-200 hover:border-indigo-500',
        ),
        danger: classNames(
            props.ghost
                ? 'text-red-500 bg-white hover:bg-red-100 active:bg-red-200'
                : 'text-white bg-red-500 border border-red-500 hover:bg-white hover:text-red-500 active:bg-gray-200',
        ),
        disable: classNames(
            'text-gray-300',
            props.ghost ? 'hover:bg-gray-100' : 'bg-gray-white border border-gray-200',
        ),
    }

    // 渲染加载动画圆圈
    const icon = (() => {
        if (props.loading) {
            return <RiLoader2Fill className="animate-spin-slow" />
        } else if (props.icon) {
            return props.icon
        } else {
            return null
        }
    })()

    const content = (() => {
        if (props.children) {
            return <span>{props.children}</span>
        }
        return null
    })()

    return (
        // 按钮样式
        <div className={classNames({ 'w-full': props.fullWidth })} onClick={props.disabled ? undefined : props.onClick}>
            {/* 为了修复宽度不正确的BUG，这里用div包一下 */}
            <div
                className={classNames(
                    buttonClass.base,
                    props.disabled ? buttonClass.disable : buttonClass[props.type!],
                )}
            >
                {/* 渲染icon */}
                {icon}
                {/* 渲染button文字 */}
                {content}
            </div>
        </div>
    )
}

Button.defaultProps = defaultProps

export default Button
