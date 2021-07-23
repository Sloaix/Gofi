import { RiBook2Fill } from '@hacknug/react-icons/ri'
import { RouteComponentProps } from '@reach/router'
import React from 'react'
import Button from '../components/Button'

const Preview: React.FC<RouteComponentProps> = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex w-full h-full items-center justify-center space-x-6">
                <div className="bg-blue-100 flex items-center justify-center w-[200px] h-[200px]">
                    <Button fullWidth={true}>Button</Button>
                </div>
                <Button disabled={true}>Button</Button>
                <Button disabled={true} loading={true}>
                    Button
                </Button>
                <Button loading={true}>Button</Button>
                <Button loading={true}></Button>
                <Button icon={<RiBook2Fill />}></Button>
                <Button type="primary">Button</Button>
                <Button type="danger">Button</Button>
                <Button type="danger" icon={<RiBook2Fill />}>
                    Button
                </Button>
                <Button type="danger" icon={<RiBook2Fill />} loading={true}>
                    Button
                </Button>
            </div>
        </div>
    )
}

export default Preview
