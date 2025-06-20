import React, { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
}

const defualtProps: IProps = {}

const VideoViewer: React.FC<IProps> = (props) => {
    const { t } = useTranslation()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [videoLoaded, setVideoLoaded] = useState(false)

    // 监听视频加载完成事件
    useEffect(() => {
        const video = videoRef.current
        if (video) {
            const handleLoadedMetadata = () => {
                setVideoLoaded(true)
            }

            video.addEventListener('loadedmetadata', handleLoadedMetadata)
            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            }
        }
    }, [])

    return (
        <div className="w-full h-full flex flex-col relative rounded-lg overflow-hidden">
            {/* 工具栏组件 */}
            <ViewerToolbar
                currentPath={props.currentPath}
                onReturn={props.onReturn}
                onNewWindow={props.onNewWindow}
                onDownload={props.onDownload}
            />
            {/* 视频播放器容器 - 适配视频长宽比 */}
            <div className="w-full bg-black overflow-hidden flex items-center justify-center h-[600px]">
                <video
                    ref={videoRef}
                    src={props.url}
                    controls
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                >
                    {t('component.viewer.video-not-supported')}
                </video>
            </div>
        </div>
    )
}

export default VideoViewer
