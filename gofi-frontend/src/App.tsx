import React from 'react'
import { Toaster } from './components/ui/sonner'
import GofiRouter from './router'
import NetworkStatus from './components/NetworkStatus'

const App = () => {
    return (
        <>
            <GofiRouter />
            <NetworkStatus />
            <Toaster position="top-center" expand={true} richColors />
        </>
    )
}

export default App
