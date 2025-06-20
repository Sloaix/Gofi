import React, { ComponentPropsWithRef, ReactNode, useRef } from 'react'
import Modal from './Modal'

interface IProps extends ComponentPropsWithRef<any> {
    children?: ReactNode
    onFileSelected?: (files: File[]) => void
}

const defualtProps: IProps = {}

const Upload: React.FC<IProps> = React.forwardRef<HTMLInputElement, IProps>((props, ref) => {
    const inputRef = ref ? (ref as React.RefObject<HTMLInputElement>) : useRef<HTMLInputElement>(null)
    return (
        <div
            onClick={() => {
                inputRef.current?.click
            }}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let files = e.target.files
                    if (props.onFileSelected && files) {
                        props.onFileSelected(Array.from(files))
                    }
                }}
                hidden={true}
                multiple={true}
            />
            {props.children}
        </div>
    )
})

Upload

export default Upload
