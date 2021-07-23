import React, { useState } from 'react'

interface IProps {
    url?: string
}

const defualtProps: IProps = {}

const PdfViewer: React.FC<IProps> = (props) => {
    return <embed src={props.url} type="application/pdf" height="100%" width="100%"></embed>
}

PdfViewer.defaultProps = defualtProps

export default PdfViewer
