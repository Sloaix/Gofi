import { RiLoader2Fill, RiLoader4Fill, RiLoader5Fill, RiLoader5Line, RiLoaderLine } from '@hacknug/react-icons/ri'
import classNames from 'classnames'
import React, { useState } from 'react'

interface IProps {
    prefix?: React.ReactNode | string
    suffix?: React.ReactNode | string
    fullWidth?: boolean
    value?: string // 初始值
    name?: string
    loading?: boolean
    disable?: boolean
    placeholder?: string
    type?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onEnterPress?: () => void
}

const defualtProps: IProps = {
    fullWidth: false,
    type: 'input',
    loading: false,
    disable: false,
}

const Input: React.FC<IProps> = (props) => {
    const prefixSuffixBasicClass =
        'h-8 px-3 flex items-center bg-white text-sm text-gray-500 font-medium border-l border-t border-b border-gray-300 '
    const prefixElementClass = classNames(prefixSuffixBasicClass, 'rounded-md-l rounded-md-r-none')
    const suffixElementClass = classNames(prefixSuffixBasicClass, 'rounded-md-r rounded-md-l-none')
    const wrapperEelmentClass = (() => {
        let basicClass = 'inline-flex rounded-md relative'

        if (props.fullWidth) {
            basicClass = classNames(basicClass, 'w-full')
        }

        return basicClass
    })()

    const inputElementClass = (() => {
        let basicClass =
            'transition-all appearance-none h-8 px-3 bg-white font-normal transition-all border border-gray-300 text-sm text-gray-800 outline-none focus:border-indigo-500'
        const prefixClass = 'rounded-md-r rounded-md-l-none'
        const suffixClass = 'rounded-md-l rounded-md-r-none'

        const bothExist = props.prefix && props.suffix ? true : false
        const bothNone = !props.prefix && !props.suffix ? true : false

        if (props.disable || props.loading) {
            basicClass = `${basicClass} bg-gray-200 text-black-100 opacity-40`
        }

        if (props.fullWidth) {
            basicClass = `${basicClass} w-full`
        }

        if (bothExist) {
            return basicClass
        }

        if (bothNone) {
            return `${basicClass} rounded-md`
        }

        if (props.prefix) {
            return `${basicClass} ${prefixClass}`
        }

        if (props.suffix) {
            return `${basicClass} ${suffixClass}`
        }

        return basicClass
    })()

    return (
        <div className={wrapperEelmentClass}>
            {props.prefix ? <div className={prefixElementClass}>{props.prefix}</div> : null}
            <input
                name={props.name}
                value={props.value}
                type={props.type}
                onKeyPress={(e) => {
                    if (e.code === 'Enter' && props.onEnterPress) {
                        props.onEnterPress()
                    }
                }}
                className={inputElementClass}
                placeholder={props.placeholder}
                onChange={props.onChange}
                disabled={props.disable || props.loading}
            />
            {props.suffix ? <div className={suffixElementClass}>{props.suffix}</div> : null}
            {props.loading ? (
                <div className="animate-fadein absolute top-0 left-0 w-full h-full text-2xl inline-flex items-center justify-end pr-2 text-indigo-500 z-10">
                    <RiLoader5Line className="animate-spin" />
                </div>
            ) : null}
        </div>
    )
}

Input.defaultProps = defualtProps

export default Input
