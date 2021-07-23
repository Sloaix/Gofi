import { RouteComponentProps } from '@reach/router'
import React from 'react'
import notFoundImage from '../../assets/404.svg'
import Exception from '../../components/Exception'
import PureLayout from '../../components/layouts/PureLayout'

const NotFound: React.FC<RouteComponentProps> = () => {
    return (
        <PureLayout>
            <Exception title="404" message="找不到页面..." image={notFoundImage} />
        </PureLayout>
    )
}

export default NotFound
