import React, { useCallback, useEffect, useRef, useState } from 'react'
import ImageViewerToolbar from './ImageViewerToolbar'
import LogoLoading from '../LogoLoading'
import PathUtil from '@/utils/path.util'
import Toast from '@/utils/toast.util'

/**
 * 图片查看器组件的属性接口
 */
interface IProps {
    url?: string // 图片的URL地址
    imageList?: string[] // 当前目录的图片列表
    currentIndex?: number // 当前图片在列表中的索引
    onNavigate?: (index: number) => void // 导航回调函数

    // 工具栏新增属性
    currentPath?: string
    breadcrumbs?: { name: string; path: string }[]
    onNavigateBreadcrumb?: (path: string) => void
    onReturn?: () => void
    onNewWindow?: () => void
    onDownload?: () => void
    onBackToOriginal?: () => void
    showBackToOriginal?: boolean
}

/**
 * 图片查看器组件
 * 提供图片的缩放、旋转、翻转、拖拽等功能，以及上下页导航
 */
const ImageViewer: React.FC<IProps> = ({
    url,
    imageList = [],
    currentIndex = 0,
    onNavigate,
    currentPath,
    breadcrumbs,
    onNavigateBreadcrumb,
    onReturn,
    onNewWindow,
    onDownload,
    onBackToOriginal,
    showBackToOriginal,
}) => {
    // 缩放相关 state
    const [fitScale, setFitScale] = useState(1) // 适应窗口时的缩放比例
    const [scale, setScale] = useState(1) // 相对于fitToScreen的缩放倍数
    // 旋转角度，以度为单位
    const [rotation, setRotation] = useState(0)
    // 翻转状态，h为水平翻转，v为垂直翻转，1表示正常，-1表示翻转
    const [flip, setFlip] = useState({ h: 1, v: 1 })
    // 是否正在拖拽图片
    const [isDragging, setIsDragging] = useState(false)
    // 图片位置偏移量
    const [position, setPosition] = useState({ x: 0, y: 0 })
    // 图片加载状态
    const [isLoading, setIsLoading] = useState(true)
    // 全屏状态
    const [isFullscreen, setIsFullscreen] = useState(false)

    // 图片元素的引用
    const imageRef = useRef<HTMLImageElement>(null)
    // 容器元素的引用，用于全屏功能
    const containerRef = useRef<HTMLDivElement>(null)
    // 图片容器的引用，用于计算可用空间
    const imageContainerRef = useRef<HTMLDivElement>(null)
    // 适应屏幕的定时器引用，用于防抖
    const fitToScreenTimeoutRef = useRef<number | null>(null)

    // 性能优化：使用 ref 存储拖拽状态，避免重复渲染
    const dragStateRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        animationFrameId: null as number | null,
    })

    // 节流定时器引用
    const throttleTimeoutRef = useRef<number | null>(null)

    // 缩放限制常量
    const MIN_SCALE = 0.1
    const MAX_SCALE = 10

    /**
     * 重置所有变换状态到初始值
     */
    const resetTransformations = useCallback(() => {
        // 不重置缩放比例，让图片使用centerInside模式
        setRotation(0)
        setFlip({ h: 1, v: 1 })
        setPosition({ x: 0, y: 0 })
        // 开始加载新图片
        setIsLoading(true)
    }, [])

    // 当图片URL改变时，重置所有变换
    useEffect(() => {
        resetTransformations()
    }, [url, resetTransformations])

    /**
     * 节流函数，限制函数执行频率
     */
    const throttle = useCallback((func: Function, delay: number) => {
        if (throttleTimeoutRef.current) return

        throttleTimeoutRef.current = window.setTimeout(() => {
            func()
            throttleTimeoutRef.current = null
        }, delay)
    }, [])

    /**
     * 处理键盘事件，支持左右箭头键导航
     */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (imageList.length <= 1) return

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    if (currentIndex > 0) {
                        onNavigate?.(currentIndex - 1)
                    } else {
                        Toast.i('当前已经是第一张图片')
                    }
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    if (currentIndex < imageList.length - 1) {
                        onNavigate?.(currentIndex + 1)
                    } else {
                        Toast.i('当前已经是最后一张图片')
                    }
                    break
            }
        },
        [currentIndex, imageList.length, onNavigate],
    )

    // 添加键盘事件监听
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])

    /**
     * 优化的鼠标移动处理函数，使用 requestAnimationFrame
     */
    const handleMouseMove = useCallback((moveEvent: MouseEvent) => {
        if (!dragStateRef.current.isDragging) return

        // 取消之前的动画帧
        if (dragStateRef.current.animationFrameId) {
            cancelAnimationFrame(dragStateRef.current.animationFrameId)
        }

        // 使用 requestAnimationFrame 优化性能
        dragStateRef.current.animationFrameId = requestAnimationFrame(() => {
            const newX = moveEvent.pageX - dragStateRef.current.startX
            const newY = moveEvent.pageY - dragStateRef.current.startY

            // 只有当位置真正改变时才更新状态
            if (newX !== dragStateRef.current.lastX || newY !== dragStateRef.current.lastY) {
                dragStateRef.current.lastX = newX
                dragStateRef.current.lastY = newY
                setPosition({ x: newX, y: newY })
            }
        })
    }, [])

    /**
     * 优化的鼠标释放处理函数
     */
    const handleMouseUp = useCallback(() => {
        dragStateRef.current.isDragging = false
        setIsDragging(false)

        // 取消动画帧
        if (dragStateRef.current.animationFrameId) {
            cancelAnimationFrame(dragStateRef.current.animationFrameId)
            dragStateRef.current.animationFrameId = null
        }

        // 移除事件监听器
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }, [handleMouseMove])

    /**
     * 处理鼠标按下事件，开始拖拽
     * @param e 鼠标事件对象
     */
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()

        dragStateRef.current.isDragging = true
        setIsDragging(true)

        // 计算拖拽开始时的偏移量
        dragStateRef.current.startX = e.pageX - position.x
        dragStateRef.current.startY = e.pageY - position.y
        dragStateRef.current.lastX = position.x
        dragStateRef.current.lastY = position.y

        // 添加全局事件监听器
        document.addEventListener('mousemove', handleMouseMove, { passive: false })
        document.addEventListener('mouseup', handleMouseUp, { passive: false })
    }

    /**
     * 处理全屏切换
     */
    const handleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                // 退出全屏
                document.exitFullscreen()
            } else {
                // 进入全屏
                containerRef.current.requestFullscreen()
            }
        }
    }

    /**
     * 将图片适应屏幕大小 - centerInside模式
     * 只调整缩放和位置，不重置旋转和翻转
     */
    const fitToScreen = useCallback(() => {
        if (!imageRef.current || !imageContainerRef.current) return

        // 清除之前的定时器，防止重复执行
        if (fitToScreenTimeoutRef.current) {
            clearTimeout(fitToScreenTimeoutRef.current)
        }

        // 只重置图片位置
        setPosition({ x: 0, y: 0 })

        // 延迟执行，确保DOM更新完成
        fitToScreenTimeoutRef.current = setTimeout(() => {
            if (!imageRef.current || !imageContainerRef.current) return

            // 获取图片的原始尺寸
            const { naturalWidth, naturalHeight } = imageRef.current
            // 获取容器的可用尺寸
            const { width: availableWidth, height: availableHeight } = imageContainerRef.current.getBoundingClientRect()

            // 检查图片是否已加载
            if (naturalWidth === 0 || naturalHeight === 0) return

            // 计算旋转后的宽高
            let imgWidth = naturalWidth
            let imgHeight = naturalHeight
            const rot = ((rotation % 360) + 360) % 360 // 归一化到0-359
            if (rot === 90 || rot === 270) {
                imgWidth = naturalHeight
                imgHeight = naturalWidth
            }
            // 计算缩放比例，确保图片完整显示在容器内
            const scaleX = availableWidth / imgWidth
            const scaleY = availableHeight / imgHeight
            const fit = Math.min(scaleX, scaleY, 1) // 不超过原始大小

            setFitScale(fit)
            setScale(1) // 适应窗口时，scale=1
        }, 100)
    }, [rotation])

    /**
     * 重置图片到适应屏幕状态
     */
    const handleReset = useCallback(() => {
        // 归一化 rotation 到 0~359
        const normRotation = ((rotation % 360) + 360) % 360
        if (normRotation !== 0) {
            setRotation(0)
        }
        setFlip({ h: 1, v: 1 })
        setPosition({ x: 0, y: 0 })
        setScale(1)
    }, [rotation])

    // 监听图片加载完成事件
    useEffect(() => {
        if (url) {
            const image = new Image()
            image.src = url

            const handleLoad = () => {
                setIsLoading(false)
                // 图片加载完成后，自动适应屏幕
                fitToScreen()
            }

            image.addEventListener('load', handleLoad)

            // 如果图片已经加载完成，立即调用
            if (image.complete && image.naturalWidth > 0) {
                handleLoad()
            }

            return () => image.removeEventListener('load', handleLoad)
        }
    }, [url]) // 移除 fitToScreen 依赖，避免重复调用

    // 监听窗口大小改变，重新适应视口
    useEffect(() => {
        const handleResize = () => {
            if (imageRef.current && imageRef.current.complete) {
                fitToScreen()
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [fitToScreen])

    // 清理定时器和动画帧，防止内存泄漏
    useEffect(() => {
        return () => {
            if (fitToScreenTimeoutRef.current) {
                clearTimeout(fitToScreenTimeoutRef.current)
            }
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current)
            }
            if (dragStateRef.current.animationFrameId) {
                cancelAnimationFrame(dragStateRef.current.animationFrameId)
            }
        }
    }, [])

    // 图片的样式对象，包含所有变换效果
    const originScale = fitScale * scale
    const imageStyle: React.CSSProperties = {
        // 使用 transform3d 启用硬件加速
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${originScale}) scaleX(${flip.h}) scaleY(${flip.v}) rotate(${rotation}deg)`,
        transformOrigin: 'center center', // 确保缩放从中心开始
        transition: isDragging ? 'none' : 'transform 0.2s ease-out', // 拖拽时禁用过渡动画
        cursor: isDragging ? 'grabbing' : 'grab', // 根据拖拽状态改变光标样式
        // 启用硬件加速
        willChange: isDragging ? 'transform' : 'auto',
        // 防止拖拽时选中文本
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        // 关键：设置最大宽度为none，覆盖掉可能的默认样式
        maxWidth: 'none',
    }

    // 使用useCallback创建一个稳定的滚轮事件处理器
    // 这是解决缩放倍率异常增加的关键
    const wheelHandler = useCallback((e: WheelEvent) => {
        e.preventDefault()
        if (e.deltaY < 0) {
            // 向上滚动，放大图片
            setScale((s) => Math.min(s * 1.1, 10))
        } else {
            // 向下滚动，缩小图片
            setScale((s) => Math.max(s / 1.1, 0.1))
        }
    }, []) // 空依赖数组确保函数引用稳定

    // 使用useEffect来管理事件监听器的生命周期
    useEffect(() => {
        const container = imageContainerRef.current
        if (container) {
            container.addEventListener('wheel', wheelHandler, { passive: false })

            // 返回一个清理函数，在组件卸载或依赖变化时执行
            return () => {
                container.removeEventListener('wheel', wheelHandler)
            }
        }
    }, [wheelHandler]) // 依赖于稳定的wheelHandler

    // 检查是否可以显示导航按钮
    const canNavigate = imageList.length > 1
    const canGoPrev = canNavigate && currentIndex > 0
    const canGoNext = canNavigate && currentIndex < imageList.length - 1

    useEffect(() => {
        fitToScreen()
    }, [rotation])

    return (
        <div ref={containerRef} className="w-full max-h-[600px] flex flex-col relative rounded-lg overflow-hidden">
            {/* 图片工具栏组件 */}
            <ImageViewerToolbar
                // 通用功能
                onReturn={onReturn}
                onNewWindow={onNewWindow}
                onDownload={onDownload}
                onFullscreen={handleFullscreen}
                isFullscreen={isFullscreen}
                currentPath={currentPath}
                breadcrumbs={breadcrumbs}
                onNavigateBreadcrumb={onNavigateBreadcrumb}
                // 图片特有功能
                onPrevious={canGoPrev ? () => onNavigate?.(currentIndex - 1) : undefined}
                onNext={canGoNext ? () => onNavigate?.(currentIndex + 1) : undefined}
                hasPrevious={canGoPrev}
                hasNext={canGoNext}
                onZoomIn={() => setScale((s) => Math.min(s * 1.2, 10))}
                onZoomOut={() => setScale((s) => Math.max(s / 1.2, 0.1))}
                onZoomFit={fitToScreen}
                onZoomReset={handleReset}
                onRotateLeft={() => setRotation((r) => r - 90)}
                onRotateRight={() => setRotation((r) => r + 90)}
                onFlipHorizontal={() => setFlip((f) => ({ ...f, h: f.h * -1 }))}
                onFlipVertical={() => setFlip((f) => ({ ...f, v: f.v * -1 }))}
                onBackToOriginal={onBackToOriginal}
                showBackToOriginal={showBackToOriginal}
                pageNumber={currentIndex + 1}
                pageCount={imageList.length}
            />
            {/* 图片显示容器 */}
            <div
                ref={imageContainerRef}
                className="flex-1 overflow-hidden flex items-center justify-center relative rounded-lg"
                style={{
                    // 防止拖拽时选中文本
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                }}
            >
                {/* 加载动画 - 保持和File页一致 */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-200">
                        <div className="flex flex-col items-center space-y-4">
                            <LogoLoading />
                            <div className="text-center space-y-2">
                                <span className="text-sm text-muted-foreground font-medium">正在加载图片</span>
                                {url && (
                                    <div className="text-xs text-muted-foreground">
                                        {PathUtil.getFileNameFromUrl(url)} ({currentIndex + 1}/{imageList.length})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* 图片元素 */}
                <img
                    ref={imageRef}
                    src={url}
                    alt="Image Preview"
                    style={{ ...imageStyle, opacity: isLoading ? 0 : 1 }}
                    onMouseDown={handleMouseDown}
                    className=""
                    draggable="false" // 禁用默认拖拽行为
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            </div>
        </div>
    )
}

export default ImageViewer
