import React from 'react'

interface IProps {
    url?: string
}

const defualtProps: IProps = {}

const ImageViewer: React.FC<IProps> = (props) => {
    console.log('test')

    return <img src={props.url} className="min-w-full" />
}

ImageViewer.defaultProps = defualtProps

export default ImageViewer
