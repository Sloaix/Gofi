import React from 'react'
import unauthorizeImage from '../../assets/403.svg'
import Exception from '../../components/Exception'
import PureLayout from '../../components/layouts/PureLayout'

const UnAuthorized: React.FC = () => {
    return (
        <PureLayout>
            <Exception title="404" message="无权访问此页面" image={unauthorizeImage} />
        </PureLayout>
    )
}

export default UnAuthorized
