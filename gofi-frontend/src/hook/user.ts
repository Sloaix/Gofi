import { useAtomValue, useSetAtom } from 'jotai'
import useSWR from 'swr'
import { fetchUser } from '../api/repository'
import { TOKEN } from '../constants/storage'
import QueryKey from '../constants/swr'
import { tokenState } from '../states/common.state'

export function useCurrentUser() {
    const setToken = useSetAtom(tokenState)
    const token = useAtomValue(tokenState)
    const {
        data: user,
        error,
        mutate,
        isLoading,
    } = useSWR(token ? [QueryKey.CURRENT_USER, token] : null, () => fetchUser(), {
        onError: (error: any) => {
            // 清除token状态
            setToken(null)
            // 清除session存储
            sessionStorage.removeItem(TOKEN)
        },
    })

    return { user, isLoading, error, mutate }
}
