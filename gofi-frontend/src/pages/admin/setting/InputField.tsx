import { MdCheck, MdClose, MdEdit } from '@hacknug/react-icons/md'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import Button from '../../../components/Button'
import Input from '../../../components/form/Input'
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
                disable={intpuState === 'default' || props.processing}
                fullWidth={true}
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
                                type="secondary"
                                icon={<MdEdit />}
                                disabled={TextUtil.isEmpty(props.value) ? true : false || props.processing}
                                onClick={() => {
                                    setInputState('edit')
                                    if (props.onEdit) {
                                        props.onEdit()
                                    }
                                }}
                            />
                        )
                    case 'edit':
                        return (
                            <>
                                {/* 关闭按钮 */}
                                {props.processing ? null : (
                                    <Button
                                        icon={<MdClose />}
                                        onClick={() => {
                                            setInputState('default')
                                            if (props.onClose) {
                                                props.onClose()
                                            }
                                        }}
                                    />
                                )}
                                {/* 提交按钮 */}
                                <Button
                                    icon={<MdCheck />}
                                    loading={props.processing}
                                    onClick={() => {
                                        if (props.onValidate && props.onValidate() && props.onSubmit) {
                                            props.onSubmit(() => {
                                                // 把重置状态函数暴露给外部组件
                                                setInputState('default')
                                            })
                                        }
                                    }}
                                    disabled={
                                        TextUtil.isEmpty(props.value)
                                            ? true
                                            : false || props.processing || props.defaultValue === props.value
                                    }
                                />
                            </>
                        )
                }
            })()}
        </>
    )
}

InputField.defaultProps = defualtProps

export default InputField
