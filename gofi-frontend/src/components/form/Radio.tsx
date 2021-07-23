import React from 'react'

interface IProps {
    name?: string
    checked?: boolean
}

const defualtProps: IProps = {
    checked: false,
}

const Radio: React.FC<IProps> = (props) => {
    return (
        <input
            type="radio"
            name="name"
            // checked='checked'
            className="appearance-none transition-all cursor-pointer h-4 w-4 rounded-full border border-gray-300 checked:bg-indigo-500 checked:border-0"
        />
    )
}

Radio.defaultProps = defualtProps

export default Radio
