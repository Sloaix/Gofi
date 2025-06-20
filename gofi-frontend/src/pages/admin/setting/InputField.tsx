import { MdCheck, MdClose, MdEdit } from 'react-icons/md'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TextUtil from '../../../utils/text.util'

interface IProps {
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    onEdit?: () => void
    onSubmit?: (resetState: () => void) => void
    onValidate?: () => boolean
    onClose?: () => void
    processing?: boolean
    placeholder?: string
}

const defualtProps: IProps = {
    processing: false,
    onValidate: () => true,
}

type InputState = 'edit' | 'default'

const InputField: React.FC<IProps> = (props) => {
    const [intpuState, setInputState] = useState<InputState>('default')
    return (
        <>
            <Input
                value={props.value}
                disabled={intpuState === 'default' || props.processing}
                className="w-full"
                placeholder={props.placeholder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (props.onChange) {
                        props.onChange(e.target.value)
                    }
                }}
            />
            {(() => {
                switch (intpuState) {
                    case 'default':
                        // 编辑按钮
                        return (
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={TextUtil.isEmpty(props.value) ? true : false || props.processing}
                                onClick={() => {
                                    setInputState('edit')
                                    if (props.onEdit) {
                                        props.onEdit()
                                    }
                                }}
                            >
                                <MdEdit className="h-4 w-4" />
                            </Button>
                        )
                    case 'edit':
                        return (
                            <>
                                {/* 关闭按钮 */}
                                {props.processing ? null : (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setInputState('default')
                                            if (props.onClose) {
                                                props.onClose()
                                            }
                                        }}
                                    >
                                        <MdClose className="h-4 w-4" />
                                    </Button>
                                )}
                                {/* 提交按钮 */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={
                                        TextUtil.isEmpty(props.value)
                                            ? true
                                            : false || props.processing || props.defaultValue === props.value
                                    }
                                    onClick={() => {
                                        if (props.onValidate && props.onValidate() && props.onSubmit) {
                                            props.onSubmit(() => {
                                                // 把重置状态函数暴露给外部组件
                                                setInputState('default')
                                            })
                                        }
                                    }}
                                >
                                    <MdCheck className="h-4 w-4" />
                                </Button>
                            </>
                        )
                }
            })()}
        </>
    )
}

InputField

export default InputField
