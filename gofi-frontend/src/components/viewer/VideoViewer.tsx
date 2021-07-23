import React from 'react'

interface IProps {
    url?: string
}

const defualtProps: IProps = {}

const VideoViewer: React.FC<IProps> = (props) => {
    return (
        <video src={props.url} controls className="w-full">
            您的浏览器不支持 video 标签。
        </video>
    )
}

VideoViewer.defaultProps = defualtProps

export default VideoViewer
