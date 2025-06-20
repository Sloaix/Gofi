import {
    AlertTriangle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    Eraser,
    Folder,
    FolderOpen,
    Grid3X3,
    HardDrive,
    Home,
    List,
    MoreVertical,
    Move,
    RefreshCw,
    Search,
    Share,
    Trash2,
    Upload,
    Filter
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import repo, { FileInfo, DirectoryData } from '../../api/repository'
import FileIcon from '../../components/FileIcon'
import MainLayout from '../../components/layouts/MainLayout/Index'
import LogoLoading from '../../components/LogoLoading'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
    Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent,
    DialogFooter as ConfirmDialogFooter,
    DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle,
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../../components/ui/dropdown-menu'
import { Input } from '../../components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '../../components/ui/tooltip'
import { UploadDialog } from '../../components/UploadDialog'
import QueryKey from '../../constants/swr'
import { useCurrentUser } from '../../hook/user'
import EnvUtil from '../../utils/env.util'
import { FormatUtil } from '../../utils/format.util'
import MimeTypeUtil from '../../utils/mimetype.util'
import Toast from '../../utils/toast.util'
import PageHeader from '../../components/PageHeader'
import PathUtil from '../../utils/path.util'

interface FilesProps {
    directoryData?: DirectoryData
}

const Files: React.FC<FilesProps> = ({ directoryData }) => {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const uploadRef = useRef<HTMLInputElement>(null)
    const [currentPath, setCurrentPath] = useState<string>('/')
    const [uploadFiles, setUploadFiles] = useState<File[]>([])
    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [fileTypeFilter, setFileTypeFilter] = useState<string>('all')
    const { user } = useCurrentUser()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deletingItem, setDeletingItem] = useState<FileInfo | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
    const [overwriteFiles, setOverwriteFiles] = useState<File[]>([])
    const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([])
    const [overwriteUpload, setOverwriteUpload] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchPopoverAnchor, setSearchPopoverAnchor] = useState<null | HTMLElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const breadcrumbRef = useRef<HTMLDivElement>(null)

    // 路径监听
    useEffect(() => {
        const newPath = PathUtil.extractPathFromUrl(location.pathname)
        setCurrentPath(newPath)
    }, [location.pathname])

    useEffect(() => {
        if (breadcrumbRef.current) {
            breadcrumbRef.current.scrollLeft = breadcrumbRef.current.scrollWidth;
        }
    }, [currentPath]);

    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // 如果有传入的directoryData，优先使用，否则请求API
    const {
        data: apiFileInfos,
        error,
        mutate,
        isValidating,
    } = useSWR(
        // 只有在没有directoryData时才请求API
        !directoryData && currentPath ? [QueryKey.FILE_LIST, currentPath] : null, 
        async ([, dir]) => {
            const response = await repo.fetchFile(dir)
            if (response.type === 'directory') {
                return (response.data as DirectoryData).files
            }
            throw new Error('Path is not a directory')
        }
    )

    // 优先使用props传入的数据，否则使用API请求的数据
    const fileInfos = directoryData?.files || apiFileInfos
    const fetching = !fileInfos && !error && !directoryData

    // 目录操作
    const hasParentDirectory = () => currentPath !== '/' && currentPath.lastIndexOf('/') > 0
    const parentPath = () => {
        if (currentPath === '/' || !currentPath) return '/'
        const idx = currentPath.lastIndexOf('/')
        if (idx === 0) return '/'
        return currentPath.substring(0, idx)
    }

    // 生成面包屑路径
    const generateBreadcrumbs = () => {
        if (currentPath === '/') return [{ name: t('common.root-directory'), path: '/' }]

        const parts = currentPath.split('/').filter(Boolean)
        const breadcrumbs = [{ name: t('common.root-directory'), path: '/' }]

        let currentPathBuilder = ''
        parts.forEach((part, index) => {
            currentPathBuilder += '/' + part
            breadcrumbs.push({
                name: part,
                path: currentPathBuilder,
            })
        })
        return breadcrumbs
    }

    // 过滤文件列表
    const filteredFiles = fileInfos?.filter((file) => {
        // 搜索过滤
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
        
        // 文件类型过滤
        let matchesType = true
        if (fileTypeFilter !== 'all') {
            if (file.isDirectory) {
                matchesType = fileTypeFilter === 'folder'
            } else {
                matchesType = file.fileType === fileTypeFilter
            }
        }
        
        return matchesSearch && matchesType
    }) || []

    // 跳转
    const onFileNameClick = (fileinfo: FileInfo) => {
        console.log('[Files] 点击文件:', {
            name: fileinfo.name,
            path: fileinfo.path,
            isDirectory: fileinfo.isDirectory,
            fileType: fileinfo.fileType
        })
        
        if (fileinfo.isDirectory) {
            const targetUrl = PathUtil.buildFileUrl(fileinfo.path)
            console.log('[Files] 跳转到目录:', {
                originalPath: fileinfo.path,
                targetUrl
            })
            navigate(targetUrl)
        } else {
            // 如果是图片文件，通过state传递当前目录的图片列表
            if (fileinfo.fileType === 'image' || MimeTypeUtil.previewableTypeOf(fileinfo.extension, fileinfo.mime) === 'image') {
                // 获取当前目录的所有图片文件
                const imageFiles = fileInfos?.filter(file => 
                    !file.isDirectory && 
                    (file.fileType === 'image' || MimeTypeUtil.previewableTypeOf(file.extension, file.mime) === 'image')
                ) || []
                
                // 找到当前图片在列表中的索引
                const currentIndex = imageFiles.findIndex(file => file.name === fileinfo.name)
                
                // 通过state传递图片列表数据
                const imageListData = {
                    imageList: imageFiles.map(file => repo.getFilePreviewUrl(file.path)),
                    currentIndex: currentIndex >= 0 ? currentIndex : 0,
                    directoryPath: currentPath
                }
                
                const targetUrl = PathUtil.buildFileUrl(fileinfo.path)
                console.log('[Files] 跳转到图片文件:', {
                    originalPath: fileinfo.path,
                    targetUrl,
                    imageListData
                })
                navigate(targetUrl, {
                    state: { imageListData }
                })
            } else {
                const targetUrl = PathUtil.buildFileUrl(fileinfo.path)
                console.log('[Files] 跳转到普通文件:', {
                    originalPath: fileinfo.path,
                    targetUrl
                })
                navigate(targetUrl)
            }
        }
    }

    const navigateToRootDirectory = () => navigate('/file/')
    const navigateToParentDirectory = () => {
        if (!hasParentDirectory()) {
            Toast.i(t('toast.already-root-dir'))
            return
        }
        const targetUrl = PathUtil.buildFileUrl(parentPath())
        navigate(targetUrl)
    }

    const navigateToBreadcrumb = (path: string) => {
        const targetUrl = PathUtil.buildFileUrl(path)
        navigate(targetUrl)
    }

    // 获取文件类型标签
    const getFileTypeLabel = (fileInfo: FileInfo) => {
        if (fileInfo.isDirectory) {
            return t('common.file-type.folder')
        }

        switch (fileInfo.fileType) {
            case 'text':
                return t('common.file-type.text')
            case 'code':
                return t('common.file-type.code')
            case 'image':
                return t('common.file-type.image')
            case 'video':
                return t('common.file-type.video')
            case 'audio':
                return t('common.file-type.audio')
            case 'pdf':
                return t('common.file-type.pdf')
            case 'document':
                return t('common.file-type.document')
            case 'archive':
                return t('common.file-type.archive')
            case 'other':
            default:
                return t('common.file-type.file')
        }
    }

    // 获取文件图标
    const getFileIcon = (file: FileInfo) => {
        if (file.isDirectory) {
            return <FileIcon iconType="folder" className="h-5 w-5 text-primary" />
        }
        
        // 使用后端返回的图标类型
        if (file.iconType) {
            return <FileIcon iconType={file.iconType} className="h-5 w-5 text-muted-foreground" />
        }
        
        // 如果没有图标类型，使用默认文件图标
        return <FileIcon iconType="file" className="h-5 w-5 text-muted-foreground" />
    }

    // 上传
    const onUploadFiles = async (files: File[]) => {
        if (!fileInfos) {
            setUploadFiles(files)
            setShowUploadDialog(true)
            return
        }
        // 检查同名
        const existingNames = new Set(fileInfos.map(f => f.name))
        const conflictFiles = files.filter(f => existingNames.has(f.name))
        if (conflictFiles.length > 0) {
            setOverwriteFiles(conflictFiles)
            setPendingUploadFiles(files)
            setShowOverwriteDialog(true)
        } else {
            setUploadFiles(files)
            setShowUploadDialog(true)
        }
    }

    // 处理上传，增加 overwrite 支持
    const handleUpload = async (files: File[], onProgress?: (fileName: string, progress: number) => void, overwrite = false) => {
        try {
            await repo.uploadFiles(currentPath, files, onProgress || (() => {}), overwrite)
            mutate()
        } catch (e: any) {
            throw new Error(e?.message || t('pages.file-list.upload-failed'))
        }
    }

    // 适配器，保证onUpload类型兼容UploadDialog
    const handleUploadAdapter = async (
        files: File[],
        onProgress?: (fileName: string, progress: number) => void,
        overwrite = false
    ) => {
        await handleUpload(
            files,
            onProgress
                ? (fileNameOrProgress: any, progressOrTotal: any) => {
                    if (files.length === 1) {
                        if (typeof fileNameOrProgress === 'number' && typeof progressOrTotal === 'number') {
                            const percent = Math.round((fileNameOrProgress / (progressOrTotal || 1)) * 100)
                            onProgress(files[0].name, percent)
                        } else {
                            onProgress(fileNameOrProgress, progressOrTotal)
                        }
                    }
                }
                : undefined,
            overwrite
        );
    };

    // 处理文件操作
    const handleDownload = (file: FileInfo) => {
        const downloadUrl = repo.getFileDownloadUrl(file.path)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleShare = (file: FileInfo) => {
        const shareUrl = repo.getFilePreviewUrl(file.path)
        if (navigator.share) {
            navigator.share({
                title: file.name,
                url: shareUrl
            })
        } else {
            navigator.clipboard.writeText(shareUrl)
            Toast.s(t('toast.link_copied'))
        }
    }

    const handleCopy = (file: FileInfo) => {
        // TODO: 实现复制功能
        Toast.i(t('toast.feature_coming_soon'))
    }

    const handleMove = (file: FileInfo) => {
        // TODO: 实现移动功能
        Toast.i(t('toast.feature_coming_soon'))
    }

    const handleDelete = (file: FileInfo) => {
        setDeletingItem(file)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (!deletingItem) return
        setDeleteLoading(true)
        try {
            await repo.deleteFileOrFolder(deletingItem.path)
            Toast.s(t('pages.file-list.delete-success'))
            setShowDeleteDialog(false)
            setDeletingItem(null)
            mutate()
        } catch (e: any) {
            Toast.e(e?.message || t('toast.delete-failed'))
        } finally {
            setDeleteLoading(false)
        }
    }

    // 渲染工具栏
    const renderToolbar = () => {
        const breadcrumbs = generateBreadcrumbs()
        const MAX_BREADCRUMBS_TO_SHOW = 4;
        return (
            <div className="flex items-center justify-between bg-background/95 backdrop-blur-sm border-b border-border p-2 rounded-t-lg mb-6">
                {/* 左侧：Home、Back、面包屑 */}
                <div className="flex items-center space-x-2 min-w-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={navigateToRootDirectory} className="h-8 w-8 p-0 flex-shrink-0">
                                    <Home className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('tooltip.home')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {hasParentDirectory() && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={navigateToParentDirectory} className="h-8 w-8 p-0">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('tooltip.back')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    
                    <Separator orientation="vertical" className="h-6" />
                    
                    {/* 面包屑导航 */}
                    <div
                        className="flex items-center text-sm text-muted-foreground min-w-0 overflow-x-auto whitespace-nowrap scrollbar-none"
                        ref={breadcrumbRef}
                    >
                        {breadcrumbs.length > MAX_BREADCRUMBS_TO_SHOW ? (
                            <>
                                {/* First item */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span
                                                className="px-1.5 py-1 rounded-md hover:bg-muted cursor-pointer truncate"
                                                onClick={() => navigateToBreadcrumb(breadcrumbs[0].path)}
                                            >
                                                {breadcrumbs[0].name}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{breadcrumbs[0].name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />

                                {/* Ellipsis with Tooltip for the full path */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="px-1.5 py-1 font-semibold">...</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{currentPath}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />

                                {/* Last two items */}
                                {breadcrumbs.slice(-2).map((crumb, index) => (
                                    <React.Fragment key={crumb.path}>
                                         <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span
                                                        className={`px-1.5 py-1 rounded-md truncate ${index === 1 ? 'text-foreground font-semibold' : 'hover:bg-muted cursor-pointer'}`}
                                                        onClick={() => navigateToBreadcrumb(crumb.path)}
                                                    >
                                                        {crumb.name}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{crumb.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        {index < 1 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                                    </React.Fragment>
                                ))}
                            </>
                        ) : (
                            // Show all breadcrumbs if they are not too long
                            breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={crumb.path}>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span
                                                    className={`px-1.5 py-1 rounded-md truncate ${index === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : 'hover:bg-muted cursor-pointer'}`}
                                                    onClick={() => navigateToBreadcrumb(crumb.path)}
                                                >
                                                    {crumb.name}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{crumb.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                                </React.Fragment>
                            ))
                        )}
                    </div>
                </div>

                {/* 第二行：搜索、过滤、操作按钮 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {/* 悬浮搜索框 */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                                onClick={e => {
                                    setSearchOpen(true)
                                    setSearchPopoverAnchor(e.currentTarget)
                                }}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                            {searchOpen && (
                                <div
                                    className="absolute left-0 top-10 z-50 w-64 bg-popover border border-border rounded-lg shadow-lg p-2 animate-in fade-in"
                                    onBlur={e => {
                                        // 失焦时收起（但点击输入框本身不收起）
                                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                            setSearchOpen(false)
                                        }
                                    }}
                                    tabIndex={-1}
                                >
                                    <Input
                                        ref={searchInputRef}
                                        placeholder={t('form.search.placeholder')}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onBlur={() => setSearchOpen(false)}
                                        className="h-9 text-sm rounded-md"
                                    />
                                </div>
                            )}
                        </div>
                        {/* 文件类型过滤器图标化 */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => setFileTypeFilter('all')} className={fileTypeFilter === 'all' ? 'bg-accent text-accent-foreground' : ''}>
                                    <Grid3X3 className="mr-2 h-4 w-4" />{t('common.file-type.all')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('folder')} className={fileTypeFilter === 'folder' ? 'bg-accent text-accent-foreground' : ''}>
                                    <Folder className="mr-2 h-4 w-4" />{t('common.file-type.folder')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('text')} className={fileTypeFilter === 'text' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="text" className="mr-2 h-4 w-4" />{t('common.file-type.text')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('code')} className={fileTypeFilter === 'code' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="code" className="mr-2 h-4 w-4" />{t('common.file-type.code')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('image')} className={fileTypeFilter === 'image' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="image" className="mr-2 h-4 w-4" />{t('common.file-type.image')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('video')} className={fileTypeFilter === 'video' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="video" className="mr-2 h-4 w-4" />{t('common.file-type.video')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('audio')} className={fileTypeFilter === 'audio' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="audio" className="mr-2 h-4 w-4" />{t('common.file-type.audio')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('pdf')} className={fileTypeFilter === 'pdf' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="pdf" className="mr-2 h-4 w-4" />{t('common.file-type.pdf')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('document')} className={fileTypeFilter === 'document' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="document" className="mr-2 h-4 w-4" />{t('common.file-type.document')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('archive')} className={fileTypeFilter === 'archive' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="archive" className="mr-2 h-4 w-4" />{t('common.file-type.archive')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFileTypeFilter('other')} className={fileTypeFilter === 'other' ? 'bg-accent text-accent-foreground' : ''}>
                                    <FileIcon iconType="other" className="mr-2 h-4 w-4" />{t('common.file-type.other')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* 上传文件按钮 */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button onClick={() => {
                                        if (!user) {
                                            Toast.e(t('pages.file-list.please-login-first'))
                                            return
                                        }
                                        uploadRef.current?.click()
                                    }} variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('tooltip.upload')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {/* 刷新按钮 */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => mutate()}
                                        className="h-8 w-8 p-0"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('tooltip.refresh')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {/* 视图切换按钮 */}
                        <div className="flex items-center border border-border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        {EnvUtil.isPreviewMode && (
                            <>
                                <Separator orientation="vertical" className="h-6" />
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs text-amber-800 font-medium">{t('common.demo-mode')}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // 渲染文件列表
    const renderFileList = () => {
        if (fetching || isValidating) {
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

        if (error) {
            return (
                <Alert variant="destructive" className="my-8">
                    <AlertTitle>{t('pages.file-list.load-failed.title')}</AlertTitle>
                    <AlertDescription>
                        {t('pages.file-list.load-failed.message')}
                    </AlertDescription>
                </Alert>
            )
        }

        if (!fileInfos || fileInfos.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Folder className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('pages.file-list.empty-folder.title')}</h3>
                    <p className="text-muted-foreground mb-6">{t('pages.file-list.empty-folder.description')}</p>
                    <Button onClick={() => setShowUploadDialog(true)}>
                        {t('pages.file-list.upload-files')}
                    </Button>
                </div>
            )
        }

        if (searchQuery && filteredFiles.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('form.search.no-results')}</h3>
                    <p className="text-muted-foreground">{t('form.search.try-different')}</p>
                </div>
            )
        }

        const filesToShow = filteredFiles

        return (
            <div className="space-y-4">
                {/* 统计信息 */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                        <span>{t('common.total-items', { count: filesToShow.length })}</span>
                        {(searchQuery || fileTypeFilter !== 'all') && (
                            <span className="text-primary flex items-center space-x-1">
                                {searchQuery && t('form.search.term', { term: searchQuery })}
                                {searchQuery && fileTypeFilter !== 'all' && ' | '}
                                {fileTypeFilter !== 'all' && (
                                    <>
                                        <FileIcon iconType={fileTypeFilter} className="inline-block w-4 h-4 mr-1 align-text-bottom" />
                                        {getFileTypeLabel(filesToShow[0] as FileInfo)}
                                    </>
                                )}
                            </span>
                        )}
                        {(searchQuery || fileTypeFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setFileTypeFilter('all')
                                }}
                                className="ml-2 flex items-center px-3 py-1.5 rounded-md bg-primary text-white font-medium shadow hover:bg-primary/90 transition-colors text-sm"
                                type="button"
                            >
                                <Eraser className="w-4 h-4 mr-1" />
                                {t('form.filter.clear')}
                            </button>
                        )}
                    </div>
                    {fileInfos && (
                        <span>
                            {t('common.total-size')}: {FormatUtil.formatBytes(
                                fileInfos
                                    .filter(f => !f.isDirectory)
                                    .reduce((sum, f) => sum + f.size, 0)
                            )}
                        </span>
                    )}
                </div>

                {/* 文件列表 - 根据视图模式渲染 */}
                {viewMode === 'grid' ? (
                    /* 网格视图 */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filesToShow.map((item) => (
                            <div
                                key={item.path}
                                onClick={() => onFileNameClick(item)}
                                className="group relative bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        {getFileIcon(item)}
                                        <Badge variant={item.isDirectory ? "default" : "secondary"}>
                                            {getFileTypeLabel(item)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!item.isDirectory && (
                                                    <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDownload(item); }}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        {t('tooltip.download')}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShare(item); }}>
                                                    <Share className="mr-2 h-4 w-4" />
                                                    {t('tooltip.share')}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleCopy(item); }}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    {t('menu.copy')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleMove(item); }}>
                                                    <Move className="mr-2 h-4 w-4" />
                                                    {t('menu.move')}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(item); }} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t('menu.delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                
                                <h3 className="font-medium text-foreground mb-2 truncate" title={item.name}>
                                    {item.name}
                                </h3>
                                
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    {!item.isDirectory && (
                                        <div className="flex items-center space-x-1">
                                            <HardDrive className="h-3 w-3" />
                                            <span>{FormatUtil.formatBytes(item.size)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{FormatUtil.formatTime(item.lastModified * 1000)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 列表视图 */
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                            {t('common.file-name')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                            {t('common.type')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                            {t('common.file-size')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                            {t('common.last-modified')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filesToShow.map((item) => (
                                        <tr
                                            key={item.path}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div 
                                                    className="flex items-center space-x-3 cursor-pointer"
                                                    onClick={() => onFileNameClick(item)}
                                                >
                                                    {getFileIcon(item)}
                                                    <span className="font-medium text-foreground truncate max-w-[300px]">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={item.isDirectory ? "default" : "secondary"}>
                                                    {getFileTypeLabel(item)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {item.isDirectory ? '--' : FormatUtil.formatBytes(item.size)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {FormatUtil.formatTime(item.lastModified * 1000)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-1">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDownload(item); }}>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                {t('tooltip.download')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShare(item); }}>
                                                                <Share className="mr-2 h-4 w-4" />
                                                                {t('tooltip.share')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleCopy(item); }}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                {t('menu.copy')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleMove(item); }}>
                                                                <Move className="mr-2 h-4 w-4" />
                                                                {t('menu.move')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(item); }} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                {t('menu.delete')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <MainLayout>
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* 页面标题 */}
                    <PageHeader
                        icon={<FolderOpen className="h-6 w-6 text-primary" />}
                        title={t('pages.file-list.title')}
                        description={t('pages.file-list.description')}
                    />

                    {/* 工具栏 */}
                    {renderToolbar()}

                    {/* 文件列表 */}
                    {renderFileList()}
                </div>

                {/* 删除确认弹窗 */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {deletingItem ? t('pages.file-list.delete-title', { name: deletingItem.name }) : ''}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="mb-4 text-sm text-muted-foreground">
                            {deletingItem && (
                                <div className="mt-2 border rounded bg-muted/30">
                                    <div className="flex px-3 py-1 text-xs text-muted-foreground font-medium border-b">
                                        <span className="flex-1 truncate">{t('common.file-name')}</span>
                                        <span className="w-24 text-center">{t('common.type')}</span>
                                        <span className="w-24 text-center">{t('common.file-size')}</span>
                                    </div>
                                    <div className="flex items-center px-3 py-1 text-sm border-b last:border-b-0 bg-background">
                                        <span className="flex-1 truncate">{deletingItem.name}</span>
                                        <span className="w-24 text-center">{getFileTypeLabel(deletingItem)}</span>
                                        <span className="w-24 text-center">{!deletingItem.isDirectory ? FormatUtil.formatBytes(deletingItem.size) : '--'}</span>
                                    </div>
                                </div>
                            )}
                            <div className="mt-2">
                                {deletingItem
                                    ? (deletingItem.isDirectory
                                        ? t('pages.file-list.delete-folder-desc')
                                        : t('pages.file-list.delete-file-desc'))
                                    : ''}
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={deleteLoading}>
                                    {t('form.cancel')}
                                </Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('menu.delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 覆盖确认弹窗 */}
                <ConfirmDialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
                    <ConfirmDialogContent>
                        <ConfirmDialogHeader>
                            <ConfirmDialogTitle>
                                {t('pages.file-list.overwrite-title', { count: overwriteFiles.length })}
                            </ConfirmDialogTitle>
                        </ConfirmDialogHeader>
                        <div className="mb-4 text-sm text-muted-foreground">
                            {t('pages.file-list.overwrite-desc', { count: overwriteFiles.length })}
                            <div className="mt-2 border rounded bg-muted/30">
                                <div className="flex px-3 py-1 text-xs text-muted-foreground font-medium border-b">
                                    <span className="flex-1 truncate">{t('common.file-name')}</span>
                                    <span className="w-24 text-center">{t('common.type')}</span>
                                    <span className="w-24 text-center">{t('common.file-size')}</span>
                                </div>
                                {overwriteFiles.map(f => (
                                    <div
                                        key={f.name}
                                        className="flex items-center px-3 py-1 text-sm border-b last:border-b-0 bg-background"
                                        style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                                    >
                                        <span className="flex-1 truncate">{f.name}</span>
                                        <span className="w-24 text-center">{t('common.type')}: 文件</span>
                                        <span className="w-24 text-center">{FormatUtil.formatBytes(f.size)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ConfirmDialogFooter>
                            <Button variant="outline" onClick={() => setShowOverwriteDialog(false)}>{t('form.cancel')}</Button>
                            <Button onClick={async () => {
                                setShowOverwriteDialog(false)
                                setShowUploadDialog(true)
                                setOverwriteUpload(true)
                                setUploadFiles(pendingUploadFiles)
                            }}>{t('pages.file-list.overwrite-confirm')}</Button>
                        </ConfirmDialogFooter>
                    </ConfirmDialogContent>
                </ConfirmDialog>

                {/* 隐藏的文件输入元素 */}
                <input
                    ref={uploadRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 0) {
                            onUploadFiles(files)
                        }
                        // 清空input值，允许重复选择相同文件
                        e.target.value = ''
                    }}
                />

                {/* 上传进度对话框 */}
                <UploadDialog
                    open={showUploadDialog}
                    onOpenChange={setShowUploadDialog}
                    files={uploadFiles}
                    onUpload={(files, onProgress) => handleUploadAdapter(files, onProgress, overwriteUpload)}
                    onSuccess={() => {
                        setOverwriteUpload(false)
                    }}
                    onError={(error) => {
                        setOverwriteUpload(false)
                        Toast.e(error)
                    }}
                />
            </MainLayout>
        </>
    )
}

export default Files

