import React from 'react'

interface IProps {
    url?: string
    mime?: string
}

const defualtProps: IProps = {
    mime: 'audio/mp3',
}

const AudioViewer: React.FC<IProps> = (props) => {
    return (
        <div className="p-6">
            <audio src={props.url} controls>
                您的浏览器不支持 audio 标签。
            </audio>
        </div>
    )
}

AudioViewer.defaultProps = defualtProps

export default AudioViewer
