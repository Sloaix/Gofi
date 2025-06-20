import React from 'react'
import { useLocation } from 'react-router-dom'
import useSWR from 'swr'
import repo, { FileResponse, DirectoryData, FileData } from '../../api/repository'
import Files from './Files'
import File from './File'
import LogoLoading from '../../components/LogoLoading'
import QueryKey from '../../constants/swr'
import PathUtil from '../../utils/path.util'

const FileRouter: React.FC = () => {
    const location = useLocation()

    // 从 URL 路径中提取文件路径
    const getFilePath = () => {
        return PathUtil.extractPathFromUrl(location.pathname)
    }

    const filePath = getFilePath()

    // 统一的文件/目录信息请求 - 只请求一次
    const { data: fileResponse, error, isLoading } = useSWR(
        filePath ? [QueryKey.FILE_DETAIL, filePath] : null,
        async ([, path]) => {
            console.log('[FileRouter] 请求文件/目录信息:', path)
            return await repo.fetchFile(path)
        }
    )

    // 加载中显示加载动画
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <LogoLoading className="mb-4" />
                <div className="text-center mt-2">
                    <span className="text-sm text-muted-foreground font-medium">
                        加载中...
                    </span>
                </div>
            </div>
        )
    }

    // 错误处理
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">加载失败</h2>
                    <p className="text-muted-foreground mb-4">{error.message}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        重试
                    </button>
                </div>
            </div>
        )
    }

    // 根据返回类型渲染对应组件
    if (fileResponse?.type === 'directory') {
        console.log('[FileRouter] 渲染目录页面，传递目录数据')
        return <Files directoryData={fileResponse.data as DirectoryData} />
    } else if (fileResponse?.type === 'file') {
        console.log('[FileRouter] 渲染文件页面，传递文件数据')
        return <File fileData={fileResponse.data as FileData} />
    }

    // 默认情况（根路径或未知类型）
    console.log('[FileRouter] 渲染默认文件列表页面')
    return <Files />
}

export default FileRouter 