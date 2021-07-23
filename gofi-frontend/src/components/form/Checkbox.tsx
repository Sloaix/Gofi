import React from 'react'

interface IProps {
    name?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    checked?: boolean
}

const defualtProps: IProps = {
    checked: false,
}

const Demo: React.FC<IProps> = (props) => {
    return (
        <input
            className="appearance-none transition-all cursor-pointer h-4 w-4 border border-gray-300 rounded checked:bg-indigo-500"
            type="checkbox"
            name="name"
            checked={props.checked}
            onChange={props.onChange}
        />
    )
}

Demo.defaultProps = defualtProps

export default Demo
