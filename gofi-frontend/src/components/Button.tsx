import classNames from 'classnames'
import React from 'react'

type ButtonType = 'default' | 'primary' | 'danger' | 'text'

interface IProps {
    type?: ButtonType // 按钮默认类型
    fullWidth?: boolean // 是否充满宽度
    disabled?: boolean // 是否不可用
    loading?: boolean // 是否加载状态
    icon?: React.ReactNode // 渲染的icon
    onClick?: () => void
    showBorder?: boolean // 是否渲染border
}

// 默认值
const defaultProps: IProps = {
    type: 'default',
    fullWidth: false,
    disabled: false,
    loading: false,
    icon: undefined,
}

const Button: React.FC<IProps> = (props) => {
    const ButtonTypeClasses = {
        default:
            'cursor-pointer text-gray-600 bg-white  hover:text-indigo-400 active:text-indigo-700 hover:border-indigo-400 active:border-indigo-600',
        primary: 'cursor-pointer text-white bg-indigo-500 hover:opacity-90 active:bg-indigo-600',
        danger: 'cursor-pointer text-white bg-red-500 hover:opacity-90 active:bg-red-600',
        text: 'cursor-pointer text-gray-600 ',
    }

    const onlyHasIcon = !props.children && (props.loading || props.icon)

    const basicClass = classNames(
        { 'w-8': onlyHasIcon },
        { 'px-4 py-2': !onlyHasIcon },
        'h-8 select-none whitespace-nowrap space-x-2 transition-all flex items-center justify-center  font-medium text-base rounded-md',
        { 'shadow hover:shadow-md border border-gray-300': props.type !== 'text' },
    )

    const disableClass = 'cursor-not-allowed text-gray-300 bg-gray-100 shadow-none hover:shadow-none'

    // 渲染加载动画圆圈
    const icon = (() => {
        if (props.loading) {
            return (
                <svg
                    className={classNames(
                        'animate-spin h-4 w-4',
                        { 'text-white': props.type !== 'default' && !props.disabled },
                        { 'text-indigo-500': props.type === 'default' || props.disabled },
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )
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
            <div className={classNames(basicClass, props.disabled ? disableClass : ButtonTypeClasses[props.type!])}>
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
