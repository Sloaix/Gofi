import useSWR from 'swr'
import { fetchConfiguration } from '../api/repository'
import QueryKey from '../constants/swr'

export function useConfiguration() {
    const { data, error, isLoading } = useSWR(QueryKey.CONFIG, fetchConfiguration)
    // data?.initialized 表示是否初始化
    return { isInitialized: !!data?.initialized, isLoading, error }
} 