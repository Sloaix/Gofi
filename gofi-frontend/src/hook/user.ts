import { useRecoilValue, useSetRecoilState } from 'recoil'
import useSWR from 'swr'
import { TOKEN } from '../constants/storage'
import QueryKey from '../constants/swr'
import { tokenState } from '../states/common.state'

export function useCurrentUser() {
    const setToken = useSetRecoilState(tokenState)
    const token = useRecoilValue(tokenState)
    const {
        data: user,
        error,
        mutate,
    } = useSWR(token ? [QueryKey.CURRENT_USER, token] : null, () => fetchUser(), {
        onError: (error: any) => {
            // 清除token状态
            setToken(null)
            // 清除session存储
            sessionStorage.removeItem(TOKEN)
        },
    })

    // isIdle代表函数还未准备好,需要等待token有值后才能继续加载
    return { user, isIdle: !token, isLoading: !user && !error && token, error, mutate }
}

function fetchUser() {
    throw new Error('Function not implemented.')
}
