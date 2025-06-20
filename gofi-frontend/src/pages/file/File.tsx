import { AlertTriangle, Download, File as FileIcon } from 'lucide-react'
import React, { lazy, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import repo, { DirectoryData, FileData, FileInfo } from '../../api/repository'
import FileIconComponent from '../../components/FileIcon'
import LogoLoading from '../../components/LogoLoading'
import MainLayout from '../../components/layouts/MainLayout/Index'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import QueryKey from '../../constants/swr'
import { FormatUtil } from '../../utils/format.util'
import MimeTypeUtil, { PreviewableFileType } from '../../utils/mimetype.util'
import PathUtil from '../../utils/path.util'
import Files from './Files'

const TextViewer = lazy(() => import('../../components/viewer/TextViewer'))
const AudioViewer = lazy(() => import('../../components/viewer/AudioViewer'))
const ImageViewer = lazy(() => import('../../components/viewer/ImageViewer'))
const PdfViewer = lazy(() => import('../../components/viewer/PdfViewer'))
const VideoViewer = lazy(() => import('../../components/viewer/VideoViewer'))

// 图片列表数据的接口
interface ImageListData {
    imageList: string[]
    currentIndex: number
    directoryPath: string
}

interface FileProps {
    fileData?: FileData
}

const File: React.FC<FileProps> = ({ fileData }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [downloadUrl, setDownloadUrl] = useState<string>()
    const [previewUrl, setPreviewUrl] = useState<string>()
    const [fileInfo, setFileInfo] = useState<FileInfo>()
    const [previewableFileType, setPreviewableFileType] = useState<PreviewableFileType | null>(null)
    const [loading, setLoading] = useState(false)
    const [imageLoading, setImageLoading] = useState(false)
    const [imageList, setImageList] = useState<string[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [loadingImageInfo, setLoadingImageInfo] = useState<{ name: string; index: number; total: number } | null>(
        null,
    )
    const [currentPath, setCurrentPath] = useState<string>('')
    const [originalImageInfo, setOriginalImageInfo] = useState<{
        url: string
        path: string
        index: number
    } | null>(null)
    const { t } = useTranslation()

    const pathQuery = () => {
        return PathUtil.extractPathFromUrl(location.pathname)
    }

    // 获取文件/目录信息
    const { data: fileResponse, error } = useSWR(
        pathQuery() ? [QueryKey.FILE_DETAIL, pathQuery()] : null,
        async ([, path]) => {
            return await repo.fetchFile(path)
        },
    )

    // 如果获取到的是目录，直接渲染Files组件
    if (fileResponse?.type === 'directory') {
        return <Files />
    }

    // 如果还在加载中，显示加载动画
    if (!fileResponse && !error) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <LogoLoading className="mb-4" />
                <div className="text-center mt-2">
                    <span className="text-sm text-muted-foreground font-medium">加载文件信息...</span>
                </div>
            </div>
        )
    }

    // 如果请求失败，显示错误信息
    if (error) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center py-16">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">文件不存在</h2>
                    <p className="text-muted-foreground mb-4">请求的文件路径不存在或无法访问</p>
                    <Button onClick={() => navigate('/file')}>返回文件列表</Button>
                </div>
            </MainLayout>
        )
    }

    // 确保是文件类型
    if (fileResponse?.type !== 'file') {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center py-16">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">无效的文件类型</h2>
                    <p className="text-muted-foreground mb-4">请求的路径不是文件</p>
                    <Button onClick={() => navigate('/file')}>返回文件列表</Button>
                </div>
            </MainLayout>
        )
    }

    // 获取文件信息
    const currentFileInfo =
        fileData?.file || (fileResponse?.type === 'file' ? (fileResponse.data as FileData).file : undefined)

    // 获取当前文件的目录路径
    const getCurrentDirectory = (filePath: string) => {
        const lastSlashIndex = filePath.lastIndexOf('/')
        if (lastSlashIndex === -1) return ''
        return filePath.substring(0, lastSlashIndex)
    }

    // 使用SWR获取目录文件列表
    const getDirectoryPath = (fileInfo: FileInfo) => {
        return getCurrentDirectory(fileInfo.path)
    }

    const { data: directoryFiles } = useSWR(
        currentFileInfo && previewableFileType === 'image'
            ? [QueryKey.FILE_LIST, getDirectoryPath(currentFileInfo)]
            : null,
        async ([, dirPath]) => {
            const response = await repo.fetchFile(dirPath)
            if (response.type === 'directory') {
                return (response.data as DirectoryData).files
            }
            throw new Error('Path is not a directory')
        },
    )

    // 处理图片列表数据
    const processImageList = (fileInfo: FileInfo) => {
        // 首先尝试从location.state获取数据
        const stateData = location.state?.imageListData as ImageListData | undefined

        if (stateData && stateData.directoryPath === getCurrentDirectory(fileInfo.path)) {
            // 使用传递的数据
            setImageList(stateData.imageList)
            setCurrentImageIndex(stateData.currentIndex)

            // 更新预览URL为当前索引的图片
            if (stateData.imageList[stateData.currentIndex]) {
                setPreviewUrl(stateData.imageList[stateData.currentIndex])

                // 从预览URL中提取文件路径并更新下载URL
                const url = new URL(stateData.imageList[stateData.currentIndex])
                const pathParam = url.searchParams.get('path')
                if (pathParam) {
                    setDownloadUrl(repo.getFileDownloadUrl(pathParam))
                }

                // 保存原始图片信息
                setOriginalImageInfo({
                    url: stateData.imageList[stateData.currentIndex],
                    path: pathParam || '',
                    index: stateData.currentIndex,
                })
            }
            return
        }

        // 如果没有传递的数据，使用SWR获取的数据
        if (directoryFiles) {
            const imageFiles = directoryFiles.filter(
                (file) => !file.isDirectory && MimeTypeUtil.previewableTypeOf(file.extension, file.mime) === 'image',
            )

            const imageUrls = imageFiles.map((file) => repo.getFilePreviewUrl(file.path))
            setImageList(imageUrls)

            // 找到当前图片在列表中的索引
            const currentIndex = imageFiles.findIndex((file) => file.name === fileInfo.name)
            const finalIndex = currentIndex >= 0 ? currentIndex : 0
            setCurrentImageIndex(finalIndex)

            // 更新预览URL为当前索引的图片
            if (imageUrls[finalIndex]) {
                setPreviewUrl(imageUrls[finalIndex])

                // 从预览URL中提取文件路径并更新下载URL
                const url = new URL(imageUrls[finalIndex])
                const pathParam = url.searchParams.get('path')
                if (pathParam) {
                    setDownloadUrl(repo.getFileDownloadUrl(pathParam))
                }

                // 保存原始图片信息
                setOriginalImageInfo({
                    url: imageUrls[finalIndex],
                    path: pathParam || '',
                    index: finalIndex,
                })
            }
        }
    }

    useEffect(() => {
        if (currentFileInfo) {
            setFileInfo(currentFileInfo)
            setCurrentPath(currentFileInfo.path)

            // 根据扩展名/MIME判断预览类型
            const extension = currentFileInfo.extension?.toLowerCase() || ''
            const mime = currentFileInfo.mime || ''
            const hasContent = currentFileInfo.content !== undefined
            const backendFileType = currentFileInfo.fileType

            console.log('[File] 根据扩展名/MIME判断预览类型:', {
                extension,
                mime,
                hasContent,
                backendFileType,
            })

            let result: PreviewableFileType | null = null

            if (hasContent) {
                // 如果有内容，优先使用内容判断
                result = MimeTypeUtil.previewableTypeOf(extension, mime)
            } else if (backendFileType) {
                // 否则使用后端返回的文件类型
                result = MimeTypeUtil.previewableTypeOf(extension, mime)
            }

            console.log('[File] 最终预览类型:', result)
            setPreviewableFileType(result)

            // 设置下载URL
            setDownloadUrl(repo.getFileDownloadUrl(currentFileInfo.path))

            // 如果是图片，处理图片列表
            if (result === 'image') {
                processImageList(currentFileInfo)
            } else {
                // 非图片文件设置预览URL
                setPreviewUrl(repo.getFilePreviewUrl(currentFileInfo.path))
            }
        }
    }, [currentFileInfo])

    // 处理图片列表变化
    useEffect(() => {
        if (fileInfo && previewableFileType === 'image') {
            processImageList(fileInfo)
        }
    }, [directoryFiles, fileInfo, previewableFileType])

    // 处理图片切换
    const handleImageChange = useCallback(
        (newIndex: number) => {
            if (imageList[newIndex]) {
                setCurrentImageIndex(newIndex)
                setPreviewUrl(imageList[newIndex])

                // 从预览URL中提取文件路径并更新下载URL
                const url = new URL(imageList[newIndex])
                const pathParam = url.searchParams.get('path')
                if (pathParam) {
                    setDownloadUrl(repo.getFileDownloadUrl(pathParam))
                }

                // 更新原始图片信息
                setOriginalImageInfo({
                    url: imageList[newIndex],
                    path: pathParam || '',
                    index: newIndex,
                })
            }
        },
        [imageList],
    )

    // 处理图片加载状态
    const handleImageLoad = useCallback(() => {
        setImageLoading(false)
        setLoadingImageInfo(null)
    }, [])

    const handleImageError = useCallback(() => {
        setImageLoading(false)
        setLoadingImageInfo(null)
    }, [])

    // 处理图片加载开始
    const handleImageLoadStart = useCallback(() => {
        setImageLoading(true)
        if (originalImageInfo) {
            setLoadingImageInfo({
                name: fileInfo?.name || '',
                index: originalImageInfo.index + 1,
                total: imageList.length,
            })
        }
    }, [originalImageInfo, fileInfo, imageList])

    const getFileIcon = (fileInfo: FileInfo | undefined, type: PreviewableFileType | null) => {
        if (!fileInfo) return <FileIcon className="h-5 w-5 text-muted-foreground" />

        if (type === 'image') {
            return <FileIconComponent iconType="image" className="h-5 w-5 text-muted-foreground" />
        } else if (type === 'video') {
            return <FileIconComponent iconType="video" className="h-5 w-5 text-muted-foreground" />
        } else if (type === 'audio') {
            return <FileIconComponent iconType="audio" className="h-5 w-5 text-muted-foreground" />
        } else if (type === 'pdf') {
            return <FileIconComponent iconType="pdf" className="h-5 w-5 text-muted-foreground" />
        } else if (type === 'text') {
            return <FileIconComponent iconType="text" className="h-5 w-5 text-muted-foreground" />
        } else {
            return <FileIconComponent iconType="file" className="h-5 w-5 text-muted-foreground" />
        }
    }

    const getFileTypeLabel = (fileInfo: FileInfo | undefined, type: PreviewableFileType | null) => {
        if (!fileInfo) return t('common.file-type.file')

        if (type === 'image') {
            return t('common.file-type.image')
        } else if (type === 'video') {
            return t('common.file-type.video')
        } else if (type === 'audio') {
            return t('common.file-type.audio')
        } else if (type === 'pdf') {
            return t('common.file-type.pdf')
        } else if (type === 'text') {
            return t('common.file-type.text')
        } else {
            return t('common.file-type.file')
        }
    }

    // 渲染文件预览组件
    const renderFilePreview = () => {
        if (!fileInfo || !previewableFileType) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{t('pages.file-preview.no-preview.title')}</h2>
                    <p className="text-muted-foreground mb-4">{t('pages.file-preview.no-preview.description')}</p>
                    <Button onClick={() => window.open(downloadUrl, '_blank')}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('common.download')}
                    </Button>
                </div>
            )
        }

        switch (previewableFileType) {
            case 'text':
                return (
                    <TextViewer
                        url={previewUrl}
                        language={fileInfo.extension}
                        content={fileInfo.content}
                        fileInfo={{
                            name: fileInfo.name,
                            size: fileInfo.size,
                            extension: fileInfo.extension,
                        }}
                        currentPath={currentPath}
                        onReturn={() => navigate(PathUtil.buildFileUrl(PathUtil.parentPath(currentPath)))}
                        onDownload={() => window.open(downloadUrl, '_blank')}
                        onNewWindow={() => window.open(previewUrl, '_blank')}
                    />
                )
            case 'image':
                return (
                    <ImageViewer
                        url={previewUrl}
                        imageList={imageList}
                        currentIndex={currentImageIndex}
                        onNavigate={handleImageChange}
                        onDownload={() => window.open(downloadUrl, '_blank')}
                        onNewWindow={() => window.open(previewUrl, '_blank')}
                        onReturn={() => navigate(PathUtil.buildFileUrl(PathUtil.parentPath(currentPath)))}
                        currentPath={currentPath}
                        onNavigateBreadcrumb={(path) => navigate(PathUtil.buildFileUrl(path))}
                        onBackToOriginal={currentImageIndex !== 0 ? () => handleImageChange(0) : undefined}
                        showBackToOriginal={true}
                    />
                )
            case 'pdf':
                return (
                    <PdfViewer
                        url={previewUrl}
                        currentPath={currentPath}
                        onReturn={() => navigate(PathUtil.buildFileUrl(PathUtil.parentPath(currentPath)))}
                        onDownload={() => window.open(downloadUrl, '_blank')}
                        onNewWindow={() => window.open(previewUrl, '_blank')}
                    />
                )
            case 'video':
                return (
                    <VideoViewer
                        url={previewUrl}
                        currentPath={currentPath}
                        onReturn={() => navigate(PathUtil.buildFileUrl(PathUtil.parentPath(currentPath)))}
                        onDownload={() => window.open(downloadUrl, '_blank')}
                        onNewWindow={() => window.open(previewUrl, '_blank')}
                    />
                )
            case 'audio':
                return (
                    <AudioViewer
                        url={previewUrl}
                        currentPath={currentPath}
                        onReturn={() => navigate(PathUtil.buildFileUrl(PathUtil.parentPath(currentPath)))}
                        onDownload={() => window.open(downloadUrl, '_blank')}
                        onNewWindow={() => window.open(previewUrl, '_blank')}
                    />
                )
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-16">
                        <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{t('pages.file-preview.no-preview.title')}</h2>
                        <p className="text-muted-foreground mb-4">{t('pages.file-preview.no-preview.description')}</p>
                        <Button onClick={() => window.open(downloadUrl, '_blank')}>
                            <Download className="h-4 w-4 mr-2" />
                            {t('common.download')}
                        </Button>
                    </div>
                )
        }
    }

    return (
        <MainLayout>
            {/* 文件信息头部 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    {getFileIcon(fileInfo, previewableFileType)}
                    <div>
                        <h1 className="text-2xl font-semibold">{fileInfo?.name}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{getFileTypeLabel(fileInfo, previewableFileType)}</Badge>
                            {fileInfo?.size && (
                                <span className="text-sm text-muted-foreground">
                                    {FormatUtil.formatBytes(fileInfo.size)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 文件预览区域 */}
            <div className="bg-background border rounded-lg">{renderFilePreview()}</div>
        </MainLayout>
    )
}

export default File
