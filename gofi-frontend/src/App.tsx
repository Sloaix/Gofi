import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { RecoilRoot } from 'recoil'
import GofiRouter from './router'
const App = () => {
    return (
        <RecoilRoot>
            <GofiRouter />
            <ToastContainer className="text-sm w-auto" toastClassName="h-auto min-h-0 px-3 py-2" bodyClassName="p-0" />
        </RecoilRoot>
    )
}

export default App
