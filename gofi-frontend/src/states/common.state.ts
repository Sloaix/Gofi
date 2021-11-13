import { atom } from 'recoil'
import { TOKEN } from '../constants/storage'

export const tokenState = atom<string | null>({
    key: 'token',
    default: sessionStorage.getItem(TOKEN),
})
