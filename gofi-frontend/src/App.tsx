import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import GofiRouter from './router'
import store, { StoreContext } from './stores'
const App = () => {
    return (
        <StoreContext.Provider value={store}>
            <GofiRouter />
            <ToastContainer className="text-sm w-auto" toastClassName="h-auto min-h-0 px-3 py-2" bodyClassName="p-0" />
        </StoreContext.Provider>
    )
}

export default App
