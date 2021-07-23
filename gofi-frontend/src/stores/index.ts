import { createContext, useContext } from 'react'
import AppStore from './app.store'
import FileStore from './file.store'
import UserStore from './user.store'
const appStore = new AppStore()
const userStore = new UserStore()
const fileStore = new FileStore()

export interface Store {
    appStore: AppStore
    userStore: UserStore
    fileStore: FileStore
}

const store: Store = {
    appStore,
    userStore,
    fileStore,
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
