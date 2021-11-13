import { RiArrowGoBackFill } from '@hacknug/react-icons/ri'
import _ from 'lodash'
import { useLocalObservable } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { count, interval, take } from 'rxjs'
import useSWR from 'swr'
import { fetchConfiguration, setup } from '../api/repository'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/setup.svg'
import Button from '../components/Button'
import Input from '../components/form/Input'
import PureLayout from '../components/layouts/PureLayout'
import PageLoading from '../components/PageLoading'
import Step from '../components/Step'
import Tip from '../components/Tip'
import Tooltip from '../components/Tooltip'
import QueryKey from '../constants/swr'
import Toast from '../utils/toast.util'

interface IProps {}

const Setup: React.FC<IProps> = () => {
    const [inputValue, setInputValue] = useState<string>()
    const [processing, setProcessing] = useState<boolean>(false)
    const [counter, setCounter] = useState<number>(5)
    const [steps, setSteps] = useState<{ title: string; active: boolean; finish: boolean }[]>([
        {
            title: '配置',
            active: true,
            finish: false,
        },
        {
            title: '完成',
            active: false,
            finish: false,
        },
    ])

    const { data: config, error, mutate } = useSWR(QueryKey.CONFIG, () => fetchConfiguration())

    useEffect(() => {
        if (config) {
            setInputValue(config.defaultStoragePath)
        }
    }, [config])

    const setCompleted = () => {
        // 更新step状态为完成状态
        setSteps([
            {
                title: '配置',
                active: true,
                finish: true,
            },
            {
                title: '完成',
                active: true,
                finish: true,
            },
        ])
    }

    const isCompleted = () => {
        return _.every(steps, (step) => step.finish && step.active)
    }

    const trySubmit = async () => {
        // 校验表单
        try {
            setProcessing(true)
            if (!inputValue) {
                Toast.e('请输入存储路径')
                return
            }

            const newConfig = await setup({ customStoragePath: inputValue })

            // 重定向到主页
            if (newConfig?.initialized) {
                // 更新step组件的状态为完成
                setCompleted()
                let left = 5
                const intervalId = setInterval(() => {
                    if (left > 0) {
                        left = left - 1
                        setCounter(left)
                    } else {
                        clearInterval(intervalId)
                        // 5秒后重定向到主页
                        mutate(newConfig, false)
                        window.location.href = '/'
                    }
                }, 1000)
            } else {
                Toast.e('初始化失败')
            }
        } catch (e) {
            //
        } finally {
            setProcessing(false)
        }
    }

    if (!config && !error) {
        return <PageLoading />
    }

    return (
        <PureLayout>
            <div className="h-full max-w-xl m-auto flex flex-col items-center justify-center space-y-6">
                {/* <!-- setup card start--> */}
                <div className="bg-opacity-90 p-10 rounded-md shadow-2xl transition-all bg-white border border-gray-200 w-full space-y-10 flex flex-col items-center">
                    {/* <!-- title start --> */}
                    <div className="flex items-center justify-center space-x-4">
                        <img className="mx-auto h-12 w-auto" src={logo} />
                        <h2 className="text-center text-3xl font-extrabold text-indigo-500">Gofi 即将就绪</h2>
                    </div>
                    {/* <!-- title end --> */}

                    <div className="w-full flex justify-center">
                        <Step steps={steps} />
                    </div>
                    <Tip message="文件仓库:默认选项为Gofi程序所在路径下的Storage子目录，用户可以另行指定其他路径，且确保Gofi对该目录有读写权限。" />

                    {isCompleted() ? (
                        <span>
                            配置成功,Gofi将在 <span className="text-indigo-500 font-bold text-2xl">{counter} </span>
                            秒后自动重定向到主页
                        </span>
                    ) : (
                        <>
                            <div className="flex flex-row w-full items-center justify-end space-x-4">
                                <Input
                                    placeholder="仓库文件夹路径,例如 /Users/Sloaix/Desktop"
                                    fullWidth={true}
                                    value={inputValue}
                                    disable={processing}
                                    onChange={(e) => {
                                        setInputValue(`${e.target.value}`.replace(/\s/g, '').trim())
                                    }}
                                />
                                {/* <!-- reset button start --> */}
                                {/* 重置input到初始值 */}
                                <Tooltip title="恢复默认值">
                                    <Button
                                        icon={<RiArrowGoBackFill />}
                                        disabled={processing || inputValue === config?.defaultStoragePath}
                                        onClick={() => {
                                            setInputValue(config?.defaultStoragePath)
                                        }}
                                    />
                                </Tooltip>
                                {/* <!-- reset button end --> */}
                            </div>
                            {/* next step */}
                            <Button fullWidth={true} disabled={processing || _.isEmpty(inputValue)} onClick={trySubmit}>
                                下一步
                            </Button>
                        </>
                    )}
                </div>
                {/* <!-- setup card end --> */}
            </div>
            {/* <!-- bg start --> */}
            <img src={backgroundImage} className="absolute inset-0 w-full h-full blur-md" style={{ zIndex: -1 }} />
            {/* <!-- bg end --> */}
            {/* <!-- mask start --> */}
            <div
                className="absolute inline-block inset-0 w-full h-full bg-black opacity-40"
                style={{ zIndex: -1 }}
            ></div>
            {/* <!-- mask end --> */}
        </PureLayout>
    )
}

export default Setup
