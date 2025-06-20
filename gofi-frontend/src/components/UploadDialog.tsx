import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Progress } from './ui/progress'
import { Button } from './ui/button'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { FileText, Upload, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { RiCheckboxCircleFill, RiCloseCircleFill } from 'react-icons/ri'
import { useTranslation } from 'react-i18next'
import { FormatUtil } from '../utils/format.util'
import Toast from '../utils/toast.util'
import { useCurrentUser } from '../hook/user'

interface UploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    files: File[]
    onUpload: (files: File[], onProgress?: (fileName: string, progress: number) => void) => Promise<void>
    onSuccess?: () => void
    onError?: (error: string) => void
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
    open,
    onOpenChange,
    files,
    onUpload,
    onSuccess,
    onError
}) => {
    const { t } = useTranslation()
    const { user } = useCurrentUser()
    const [uploadProgress, setUploadProgress] = useState(0)
    const [fileProgresses, setFileProgresses] = useState<Record<string, number>>({})
    const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set())
    const [failedFiles, setFailedFiles] = useState<Set<string>>(new Set())
    const [uploadError, setUploadError] = useState('')
    const [isUploading, setIsUploading] = useState(false)

    // 当对话框打开时开始上传
    useEffect(() => {
        if (open && files.length > 0 && !isUploading) {
            startUpload()
        }
    }, [open])

    // 重置状态
    const resetState = () => {
        setUploadProgress(0)
        setFileProgresses({})
        setCompletedFiles(new Set())
        setFailedFiles(new Set())
        setUploadError('')
        setIsUploading(false)
    }

    // 开始上传
    const startUpload = async () => {
        if (files.length === 0) return

        // 检查用户登录状态
        if (!user) {
            const errorMessage = t('pages.file-list.please-login-first')
            setUploadError(errorMessage)
            onError?.(errorMessage)
            Toast.e(errorMessage)
            return
        }

        resetState()
        setIsUploading(true)

        try {
            // 初始化每个文件的进度
            const initialProgresses: Record<string, number> = {}
            files.forEach(file => {
                initialProgresses[file.name] = 0
            })
            setFileProgresses(initialProgresses)

            // 创建进度回调函数
            const onProgress = (fileName: string, progress: number) => {
                setFileProgresses(prev => {
                    const newProgresses = {
                        ...prev,
                        [fileName]: progress
                    }
                    
                    // 计算总体进度
                    const totalProgress = Object.values(newProgresses).reduce((sum, p) => sum + p, 0) / files.length
                    setUploadProgress(totalProgress)
                    
                    return newProgresses
                })
            }

            // 调用上传函数，传入进度回调
            await onUpload(files, onProgress)

            // 标记所有文件为已完成
            files.forEach(file => {
                setCompletedFiles(prev => new Set([...prev, file.name]))
            })

            // 上传完成
            Toast.s(t('toast.upload-success'))
            onSuccess?.()
            
        } catch (e: any) {
            const errorMessage = e?.message || t('pages.file-list.upload-failed')
            setUploadError(errorMessage)
            onError?.(errorMessage)
            Toast.e(errorMessage)
        } finally {
            setIsUploading(false)
            setUploadProgress(100)
        }
    }

    // 更新文件进度（供外部调用）
    const updateFileProgress = (fileName: string, progress: number) => {
        setFileProgresses(prev => {
            const newProgresses = {
                ...prev,
                [fileName]: progress
            }
            
            // 计算总体进度
            const totalProgress = Object.values(newProgresses).reduce((sum, p) => sum + p, 0) / files.length
            setUploadProgress(totalProgress)
            
            return newProgresses
        })
    }

    // 标记文件完成
    const markFileCompleted = (fileName: string) => {
        setCompletedFiles(prev => new Set([...prev, fileName]))
    }

    // 标记文件失败
    const markFileFailed = (fileName: string) => {
        setFailedFiles(prev => new Set([...prev, fileName]))
    }

    // 暴露方法给父组件
    const uploadDialogRef = React.useRef<{
        updateFileProgress: (fileName: string, progress: number) => void
        markFileCompleted: (fileName: string) => void
        markFileFailed: (fileName: string) => void
    }>(null)

    React.useImperativeHandle(uploadDialogRef, () => ({
        updateFileProgress,
        markFileCompleted,
        markFileFailed
    }))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">
                                {t('pages.file-list.upload-dialog.title')}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('pages.file-list.upload-dialog.subtitle', { count: files.length })}
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* 文件列表 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">
                                {t('pages.file-list.upload-dialog.files')}
                            </span>
                            <span className="text-muted-foreground">
                                {files.length} {t('common.files')}
                            </span>
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1">
                            {files.map((file) => {
                                const progress = fileProgresses[file.name] || 0
                                const isCompleted = completedFiles.has(file.name)
                                const isFailed = failedFiles.has(file.name)
                                
                                return (
                                    <div key={file.name} className="p-2 bg-muted/20 rounded-md border">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-0.5 bg-background rounded">
                                                <FileText className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-foreground truncate">
                                                        {file.name}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {FormatUtil.formatBytes(file.size)}
                                                        </span>
                                                        {isCompleted && (
                                                            <RiCheckboxCircleFill className="h-3 w-3 text-green-600" />
                                                        )}
                                                        {isFailed && (
                                                            <RiCloseCircleFill className="h-3 w-3 text-red-600" />
                                                        )}
                                                        {!isCompleted && !isFailed && (
                                                            <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                                                        )}
                                                    </div>
                                                </div>
                                                {!isCompleted && !isFailed && (
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {Math.round(progress)}%
                                                        </span>
                                                        <Progress value={progress} className="h-0.5 flex-1 ml-2" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 总体进度条 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">
                                {t('pages.file-list.upload-dialog.overall-progress')}
                            </span>
                            <span className="text-muted-foreground">
                                {Math.round(uploadProgress)}%
                            </span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>

                    {/* 错误信息 */}
                    {uploadError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700">
                                    {uploadError}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex justify-end space-x-2 pt-2">
                        {uploadProgress >= 100 && !uploadError && (
                            <Button 
                                onClick={() => onOpenChange(false)}
                                className="min-w-[100px]"
                            >
                                {t('common.done')}
                            </Button>
                        )}
                        {uploadError && (
                            <>
                                <Button 
                                    variant="outline" 
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('common.close')}
                                </Button>
                                <Button 
                                    onClick={startUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('common.retrying')}
                                        </>
                                    ) : (
                                        t('common.retry')
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 