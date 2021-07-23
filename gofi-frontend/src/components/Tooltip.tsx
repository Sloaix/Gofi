import React, { useState } from 'react'

interface IProps {
    title?: string
}

const defualtProps: IProps = {}

const Tooltip: React.FC<IProps> = (props) => {
    const [visible, setVisible] = useState<boolean>(false)
    return (
        <div className="relative">
            <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
                {props.children}
            </div>

            {visible ? (
                <span className="animate-fadein absolute whitespace-nowrap break-normal bottom-full mb-2 left-1/2 transform -translate-x-1/2 select-none bg-gray-700 text-white rounded px-3 py-1 text-sm text-center">
                    {props.title}
                </span>
            ) : null}
        </div>
    )
}

Tooltip.defaultProps = defualtProps

export default Tooltip
