import React, { useCallback, useRef, useState } from 'react'
import ViewerToolbar from './ViewerToolbar'

interface IProps {
    url?: string

    // 工具栏简化属性
    currentPath?: string
    onReturn?: () => void
    onNewWindow?: () => void
    onDownload?: () => void
    onBackToOriginal?: () => void
    showBackToOriginal?: boolean
    onFullscreen?: () => void
    isFullscreen?: boolean
    canFullscreen?: boolean
}

const defualtProps: IProps = {}

const PdfViewer: React.FC<IProps> = (props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // 全屏切换逻辑
    const handleFullscreen = useCallback(() => {
        if (!containerRef.current) return
        if (!isFullscreen) {
            containerRef.current.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }, [isFullscreen])

    // 监听全屏变化
    React.useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleChange)
        return () => document.removeEventListener('fullscreenchange', handleChange)
    }, [])

    return (
        <div
            ref={containerRef}
            className={`w-full rounded-lg overflow-hidden h-[800px] flex flex-col relative${isFullscreen ? ' z-50 bg-background' : ''}`}
        >
            {/* 工具栏组件 */}
            <ViewerToolbar
                currentPath={props.currentPath}
                onReturn={props.onReturn}
                onNewWindow={props.onNewWindow}
                onDownload={props.onDownload}
                onFullscreen={handleFullscreen}
                isFullscreen={isFullscreen}
                canFullscreen={true}
            />
            {/* PDF查看器 */}
            <div className="flex-1">
                <embed src={props.url} type="application/pdf" height="100%" width="100%"></embed>
            </div>
        </div>
    )
}

PdfViewer

export default PdfViewer
