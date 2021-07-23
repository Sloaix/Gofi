import { Link, useNavigate } from '@reach/router'
import React from 'react'
interface IProps {
    title?: string
    message?: string
    image?: string
    buttonText?: string
    onButtonClick?: () => void
}

const defualtProps: IProps = {}

const Exception: React.FC<IProps> = (props) => {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center">
            <img src={props.image} className="max-w-xl p-20" />
            <div className="font-medium text-4xl">{props.title}</div>
            <div className="text-lg text-gray-600 mt-4">{props.message}</div>
            <button
                onClick={() => {
                    if (props.onButtonClick) {
                        props.onButtonClick()
                    } else {
                        navigate('/')
                    }
                }}
                className="border rounded shadow-sm px-4 py-2 bg-indigo-500 text-white mt-4 hover:shadow hover:border-gray-300 text-sm"
            >
                {props.buttonText ? props.buttonText : '返回首页'}
            </button>
        </div>
    )
}

Exception.defaultProps = defualtProps

export default Exception
