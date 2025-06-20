import {
    ChevronLeft,
    ChevronRight,
    Maximize2,
    RotateCcw,
    RotateCw,
    ZoomIn,
    ZoomOut,
    FlipHorizontal,
    FlipVertical,
    Undo,
    ArrowLeft,
} from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import ViewerToolbar from './ViewerToolbar'

export interface ImageViewerToolbarProps {
    // 继承ViewerToolbar的通用功能
    onReturn?: () => void
    onNewWindow?: () => void
    onDownload?: () => void
    onFullscreen?: () => void
    canFullscreen?: boolean
    isFullscreen?: boolean
    currentPath?: string
    breadcrumbs?: { name: string; path: string }[]
    onNavigateBreadcrumb?: (path: string) => void
    className?: string
    
    // 图片特有功能
    onPrevious?: () => void
    onNext?: () => void
    hasPrevious?: boolean
    hasNext?: boolean
    onZoomIn?: () => void
    onZoomOut?: () => void
    onZoomFit?: () => void
    onZoomReset?: () => void
    onRotateLeft?: () => void
    onRotateRight?: () => void
    onFlipHorizontal?: () => void
    onFlipVertical?: () => void
    onBackToOriginal?: () => void
    showBackToOriginal?: boolean
    pageNumber?: number
    pageCount?: number
}

const ImageViewerToolbar: React.FC<ImageViewerToolbarProps> = (props) => {
    const { t } = useTranslation()
    
    return (
        <ViewerToolbar
            onReturn={props.onReturn}
            onNewWindow={props.onNewWindow}
            onDownload={props.onDownload}
            onFullscreen={props.onFullscreen}
            canFullscreen={props.canFullscreen}
            isFullscreen={props.isFullscreen}
            currentPath={props.currentPath}
            onNavigateBreadcrumb={props.onNavigateBreadcrumb}
            className={props.className}
        >
            {/* 导航按钮 */}
            {(props.hasPrevious || props.hasNext) && (
                <>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={props.onPrevious}
                                    disabled={!props.hasPrevious}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('component.viewer.toolbar.previous')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={props.onNext}
                                    disabled={!props.hasNext}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('component.viewer.toolbar.next')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Separator orientation="vertical" className="h-6" />
                </>
            )}

            {/* 缩放控制 */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onZoomOut}
                            className="h-8 w-8 p-0"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.zoom-out')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onZoomIn}
                            className="h-8 w-8 p-0"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.zoom-in')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onZoomFit}
                            className="h-8 w-8 p-0"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.zoom-fit')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onZoomReset}
                            className="h-8 w-8 p-0"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.zoom-reset')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="h-6" />

            {/* 旋转控制 */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onRotateLeft}
                            className="h-8 w-8 p-0"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.rotate-left')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onRotateRight}
                            className="h-8 w-8 p-0"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.rotate-right')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="h-6" />

            {/* 镜像控制 */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onFlipHorizontal}
                            className="h-8 w-8 p-0"
                        >
                            <FlipHorizontal className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.flip-horizontal')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onFlipVertical}
                            className="h-8 w-8 p-0"
                        >
                            <FlipVertical className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('component.viewer.toolbar.flip-vertical')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* 回到初始图片按钮 */}
            {props.showBackToOriginal && (
                <>
                    <Separator orientation="vertical" className="h-6" />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={props.onBackToOriginal}
                                    disabled={!props.onBackToOriginal}
                                    className="h-8 w-8 p-0"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('component.viewer.toolbar.back-to-original')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </>
            )}

            {/* 页码显示 */}
            {props.pageNumber && props.pageCount && props.pageCount > 0 && (
                <>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="text-sm text-muted-foreground px-2">
                        {props.pageNumber} / {props.pageCount}
                    </div>
                </>
            )}
        </ViewerToolbar>
    )
}

export default ImageViewerToolbar 