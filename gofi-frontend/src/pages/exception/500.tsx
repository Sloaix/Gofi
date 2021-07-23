import { RouteComponentProps } from '@reach/router'
import React from 'react'
import internalServerErrorImage from '../../assets/500.svg'
import Exception from '../../components/Exception'
import PureLayout from '../../components/layouts/PureLayout'

const ServerError: React.FC<RouteComponentProps> = () => {
    return (
        <PureLayout>
            <Exception title="500" message="服务器睡着了..." image={internalServerErrorImage} />
        </PureLayout>
    )
}

export default ServerError
