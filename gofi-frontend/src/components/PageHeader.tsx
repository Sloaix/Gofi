import { RiFolder2Line, RiFolder3Line } from '@hacknug/react-icons/ri'
import React from 'react'

interface IProps {
    icon?: React.ReactNode // 渲染的icon
    title?: string
}

// 默认值
const defaultProps: IProps = {
    icon: <RiFolder3Line />,
    title: 'Page Header',
}

const PageHeader: React.FC<IProps> = (props) => {
    return (
        <div className="py-6 flex items-center text-3xl text-gray-600 font-medium">
            {props.icon}
            <span className="ml-2 m-0">{props.title}</span>
        </div>
    )
}

PageHeader.defaultProps = defaultProps

export default PageHeader
