import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Footer'

interface IProps {
    children?: React.ReactNode
}

const PureLayout: React.FC<IProps> = ({ children }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-6 p-6">
            <div className="flex-grow flex flex-col items-center justify-center w-full h-full">
                <Outlet />
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default PureLayout
