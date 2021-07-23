import { FiCheckCircle, FiCircle, FiMinusCircle } from '@hacknug/react-icons/fi'
import classNames from 'classnames'
import React from 'react'
interface IProps {
    steps: Array<Step>
}

interface Step {
    title: string
    active: boolean
    finish: boolean
}

const Step: React.FC<IProps> = (props) => {
    const steps = (() => {
        const items: Array<React.ReactNode> = []
        props.steps.forEach((step, index) => {
            items.push(
                <div
                    key={index}
                    // {/* <!-- 由于开启了tailwindcss的jit模式,z-index对应的z-x不支持字符串拼接class,这里只能使用style拼接z-index来处理 --> */}
                    style={{ zIndex: props.steps.length - index - 1 }}
                    className="flex items-center justify-center relative h-full w-full"
                >
                    {/* <!-- circle start --> */}
                    <div
                        className={classNames(
                            'bg-white w-full h-full border-2 rounded-full absolute -right-10',
                            step.active ? 'border-indigo-500' : 'border-gray-300 ',
                        )}
                    />
                    {/* <!-- circle end --> */}
                    {/* <!-- rect start --> */}
                    <div
                        className={classNames(
                            'absolute w-full h-full flex items-center justify-center bg-white border-t-2 border-l-2 border-b-2 text-xl font-medium rounded-l-xl',
                            step.active ? 'text-indigo-500 border-indigo-500' : 'border-gray-300 ',
                        )}
                    >
                        {/* <!-- indicator dot start --> */}

                        <span className="mr-2">
                            {step.finish ? <FiCheckCircle /> : step.active ? <FiMinusCircle /> : <FiCircle />}
                        </span>

                        {/* < !--title start-- > */}
                        <span
                            className={classNames(
                                step.active ? 'text-indigo-500 border-indigo-500' : 'border-gray-700 ',
                            )}
                        >
                            {step.title}
                        </span>
                        {/* <!--title end-- > */}
                    </div>
                    {/* < !--rect end-- > */}
                </div>,
            )
        })
        return items
    })()

    return <div className="flex flex-row h-12 items-center w-full -ml-10 px-5">{steps}</div>
}

export default Step
