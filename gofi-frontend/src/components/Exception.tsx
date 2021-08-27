import { Link, useNavigate } from '@reach/router'
import React from 'react'
import Button from './Button'
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
            <div className="text-lg text-gray-600 my-4">{props.message}</div>
            <Button
                onClick={() => {
                    if (props.onButtonClick) {
                        props.onButtonClick()
                    } else {
                        navigate('/')
                    }
                }}
            >
                {props.buttonText ? props.buttonText : '返回首页'}
            </Button>
        </div>
    )
}

Exception.defaultProps = defualtProps

export default Exception
