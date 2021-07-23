import React from 'react'

interface IProps {}

const defualtProps: IProps = {}

const Demo: React.FC<IProps> = (props) => {
    return <></>
}

Demo.defaultProps = defualtProps

export default Demo
