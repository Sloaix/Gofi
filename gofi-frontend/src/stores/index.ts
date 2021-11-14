import { createContext, useContext } from 'react'
import AppStore from './app.store'
const appStore = new AppStore()

export interface Store {
    appStore: AppStore
}

const store: Store = {
    appStore,
}

export default store

export const StoreContext = createContext<any>(undefined as any)

export const useStore = () => {
    const store = useContext(StoreContext) as Store
    if (!store) {
        // this is especially useful in TypeScript so you don't need to be checking for null all the time
        throw new Error('useStore must be used within a StoreProvider.')
    }
    return store
}
