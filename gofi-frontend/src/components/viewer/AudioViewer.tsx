import React from 'react'
import { useTranslation } from 'react-i18next'
import ViewerToolbar from './ViewerToolbar'

interface IProps {
    url?: string
    mime?: string
    
    // 工具栏简化属性
    currentPath?: string
    onReturn?: () => void
    onNewWindow?: () => void
    onDownload?: () => void
    onBackToOriginal?: () => void
    showBackToOriginal?: boolean
}

const defualtProps: IProps = {
    mime: 'audio/mp3',
}

const AudioViewer: React.FC<IProps> = (props) => {
    const { t } = useTranslation()
    
    return (
        <div className="w-full max-h-[600px] flex flex-col relative">
            {/* 工具栏组件 */}
            <ViewerToolbar
                currentPath={props.currentPath}
                onReturn={props.onReturn}
                onNewWindow={props.onNewWindow}
                onDownload={props.onDownload}
            />
            {/* 音频播放器 */}
            <div className="flex-1 p-6 flex items-center justify-center">
                <audio src={props.url} controls className="w-full max-w-md">
                    {t('component.viewer.audio-not-supported')}
                </audio>
            </div>
        </div>
    )
}

AudioViewer

export default AudioViewer
