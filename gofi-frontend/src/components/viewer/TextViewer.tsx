import { RiLoader2Line } from '@hacknug/react-icons/ri'
import React, { useEffect, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Toast from '../../utils/toast.util'
interface IProps {
    url?: string
    language?: string
}

const defualtProps: IProps = {
    language: 'plaintext',
}

const TextViewer: React.FC<IProps> = (props) => {
    const [plainText, setplainText] = useState<string>()
    useEffect(() => {
        ;(async () => {
            if (props.url) {
                try {
                    const value = await (await fetch(props.url!)).text()
                    setplainText(value)
                } catch (err) {
                    Toast.e(`${err}`)
                }
            }
        })()
    }, [props.url])
    return plainText ? (
        <SyntaxHighlighter
            language={props.language}
            wrapLines={true}
            wrapLongLines={true}
            style={tomorrow}
            showLineNumbers={true}
            customStyle={{ width: '100%' }}
        >
            {plainText}
        </SyntaxHighlighter>
    ) : (
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
            <RiLoader2Line className="animate-spin-slow" />
            <div>加载中</div>
        </div>
    )
}

TextViewer.defaultProps = defualtProps

export default TextViewer
