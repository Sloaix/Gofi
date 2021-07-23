import { RiArrowGoBackFill } from '@hacknug/react-icons/ri'
import { RouteComponentProps } from '@reach/router'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { interval, take } from 'rxjs'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/setup.svg'
import Button from '../components/Button'
import Input from '../components/form/Input'
import PureLayout from '../components/layouts/PureLayout'
import Step from '../components/Step'
import Tip from '../components/Tip'
import Tooltip from '../components/Tooltip'
import { useStore } from '../stores'
import TextUtil from '../utils/text.util'

interface IProps extends RouteComponentProps {
    defaultStoragePath?: string
}

const Setup: React.FC<IProps> = ({ defaultStoragePath }) => {
    const { appStore } = useStore()

    const inputStore = useLocalObservable(() => ({
        storagePath: defaultStoragePath,
        setStoragePath(path: string) {
            this.storagePath = `${path}`.replace(/\s/g, '').trim()
        },
        resetPath() {
            this.storagePath = defaultStoragePath
        },
        get isEmpty() {
            return TextUtil.isEmpty(this.storagePath)
        },
        get isReady() {
            return !this.isEmpty
        },
    }))

    const countDownStore = useLocalObservable(() => ({
        value: 5,
        reduce() {
            this.value--
        },
    }))

    const stepStore = useLocalObservable(() => ({
        isComplete: false,
        steps: [
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
        ] as Array<Step>,

        complete() {
            // 更新step状态为完成状态
            this.steps.forEach((step) => {
                step.active = true
                step.finish = true
            })
            this.isComplete = true
        },
    }))

    const submitStore = useLocalObservable(() => ({
        processing: false,
        process() {
            this.processing = true
        },
        idle() {
            this.processing = false
        },
    }))

    const onSubmitClick = async () => {
        // 校验表单
        console.log('setSubmiting')
        submitStore.process()
        try {
            const newConfig = await appStore.setup(inputStore.storagePath!)
            submitStore.idle()
            // 重定向到主页
            if (newConfig?.initialized) {
                stepStore.complete()
                interval(1000)
                    .pipe(take(5))
                    .subscribe({
                        next: () => {
                            countDownStore.reduce()
                        },
                        error: () => {},
                        complete: () => {
                            submitStore.idle()
                            // config改变后,会自动显示首页
                            appStore.config = newConfig
                        },
                    })
            }
        } catch {
            submitStore.idle()
        }
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
                        <Step steps={stepStore.steps} />
                    </div>
                    <Tip message="文件仓库:默认选项为Gofi程序所在路径下的Storage子目录，用户可以另行指定其他路径，且确保Gofi对该目录有读写权限。" />

                    {stepStore.isComplete ? (
                        <span>
                            配置成功,Gofi将在{' '}
                            <span className="text-indigo-500 font-bold text-2xl">{countDownStore.value} </span>
                            秒后自动重定向到主页
                        </span>
                    ) : (
                        <>
                            <div className="flex flex-row w-full items-center justify-end space-x-4">
                                <Input
                                    placeholder="仓库文件夹路径,例如 /Users/Sloaix/Desktop"
                                    fullWidth={true}
                                    value={inputStore.storagePath}
                                    disable={submitStore.processing}
                                    onChange={(e) => {
                                        inputStore.setStoragePath(e.target.value)
                                    }}
                                />
                                {/* <!-- reset button start --> */}
                                {/* 重置input到初始值 */}
                                <Tooltip title="恢复默认值">
                                    <Button
                                        icon={<RiArrowGoBackFill />}
                                        disabled={
                                            submitStore.processing || inputStore.storagePath === defaultStoragePath
                                        }
                                        onClick={() => {
                                            inputStore.resetPath()
                                        }}
                                    />
                                </Tooltip>
                                {/* <!-- reset button end --> */}
                            </div>
                            {/* next step */}
                            <Button
                                type="primary"
                                fullWidth={true}
                                disabled={submitStore.processing || inputStore.isEmpty}
                                onClick={onSubmitClick}
                            >
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

export default observer(Setup)
