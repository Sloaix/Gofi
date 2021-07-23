import { RiAlarmWarningLine, RiInformationLine, RiShieldKeyholeLine } from '@hacknug/react-icons/ri'
import classNames from 'classnames'
import React from 'react'
interface IProps {
    message: string
    type?: string
}

const defualtProps: IProps = {
    message: '',
    type: 'default',
}

const Tip: React.FC<IProps> = (props) => {
    const basicClass =
        'flex items-center justify-start w-full leading-5 break-all min-h-[2rem] px-2 py-2 text-sm font-medium rounded-md border'
    const defaultClass = classNames(basicClass, 'bg-indigo-50 border-indigo-300 text-indigo-600')
    const dangerClass = classNames(basicClass, 'bg-red-50 border-red-300 text-red-600')
    const warningClass = classNames(basicClass, 'bg-yellow-50 border-yellow-300 text-yellow-600')

    const tipClass = (() => {
        switch (props.type) {
            case 'danger':
                return dangerClass
            case 'warning':
                return warningClass
            default:
                return defaultClass
        }
    })()

    const iconOfTip = (() => {
        switch (props.type) {
            case 'danger':
                return <RiShieldKeyholeLine />
            case 'warning':
                return <RiAlarmWarningLine />
            default:
                return <RiInformationLine />
        }
    })()
    return (
        <div className={tipClass}>
            <span className="text-2xl mr-2 mb-1">{iconOfTip}</span>
            {props.message}
        </div>
    )
}

Tip.defaultProps = defualtProps

export default Tip
