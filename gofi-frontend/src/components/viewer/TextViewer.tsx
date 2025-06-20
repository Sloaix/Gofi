import { AlertTriangle, ArrowLeft, Download, File } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineFileMarkdown } from 'react-icons/ai'
import ReactMarkdown from 'react-markdown'
import { FormatUtil } from '../../utils/format.util'
import Toast from '../../utils/toast.util'
import LogoLoading from '../LogoLoading'
import ShikiHighlighter from '../ShikiHighlighter'
import { Button } from '../ui/button'
import TextViewerToolbar from './TextViewerToolbar'

interface IProps {
    url?: string
    language?: string
    content?: string
    fileInfo?: { name: string; size: number; extension: string }

    // 工具栏简化属性
    currentPath?: string
    onReturn?: () => void
    onNewWindow?: () => void
    onDownload?: () => void
    onBackToOriginal?: () => void
    showBackToOriginal?: boolean
}

const TextViewer: React.FC<IProps> = ({
    url,
    language = 'plaintext',
    content,
    fileInfo,
    currentPath,
    onReturn,
    onNewWindow,
    onDownload,
    onBackToOriginal,
    showBackToOriginal,
}) => {
    const [plainText, setPlainText] = useState<string>()
    const [showLineNumbers, setShowLineNumbers] = useState(true)
    const [isValidText, setIsValidText] = useState(true)
    const { t } = useTranslation()

    // markdown 预览/源码切换
    const isMarkdown = fileInfo?.extension === 'md'
    const [previewMode, setPreviewMode] = useState<'preview' | 'source'>('preview')
    const [showFullText, setShowFullText] = useState(false)

    // 判断高亮语言是否支持 lock，不支持则降级为 plaintext
    const safeLanguage = language === 'lock' || language === '' || language === undefined ? 'plaintext' : language

    // 获取当前主题
    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
    const shikiTheme = isDark ? 'github-dark' : 'github-light'

    // 检查内容是否为有效的文本
    const validateTextContent = (text: string): boolean => {
        // 只排除极少数控制字符（如全是不可见字符或二进制）
        const controlChars = text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g)
        const result = !(controlChars && controlChars.length > text.length * 0.3)
        console.log('[TextViewer] validateTextContent:', {
            length: text.length,
            controlChars: controlChars?.length,
            result,
        })
        return result
    }

    const [themeVersion, setThemeVersion] = useState(0)

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setThemeVersion((v) => v + 1)
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (content) {
            const isValid = validateTextContent(content)
            setIsValidText(isValid)
            console.log('[TextViewer] useEffect content', { isValid, contentSample: content.slice(0, 200), fileInfo })
            if (isValid) {
                setPlainText(content)
            } else {
                setPlainText(undefined)
            }
            return
        }

        if (url) {
            ;(async () => {
                try {
                    const value = await (await fetch(url)).text()
                    const isValid = validateTextContent(value)
                    setIsValidText(isValid)
                    console.log('[TextViewer] useEffect url', { isValid, valueSample: value.slice(0, 200), fileInfo })
                    if (isValid) {
                        setPlainText(value)
                    } else {
                        setPlainText(undefined)
                    }
                } catch (err) {
                    Toast.e(`${err}`)
                    setIsValidText(false)
                    setPlainText(undefined)
                }
            })()
        }
    }, [url, content])

    const handleToggleLineNumbers = () => {
        setShowLineNumbers(!showLineNumbers)
    }

    // 计算是否需要截断
    const MAX_PREVIEW_LENGTH = 5000
    const isLongText = !!plainText && plainText.length > MAX_PREVIEW_LENGTH
    const displayText = plainText
        ? isLongText && !showFullText
            ? plainText.slice(0, MAX_PREVIEW_LENGTH)
            : plainText
        : ''

    // 如果内容不是有效的文本，显示错误页面
    if (!isValidText) {
        console.warn('[TextViewer] 内容被判定为无效文本', { fileInfo, plainText })
        return (
            <div className="w-full max-h-[600px] flex flex-col relative">
                {/* 工具栏组件 */}
                <TextViewerToolbar
                    currentPath={currentPath}
                    onReturn={onReturn}
                    onNewWindow={onNewWindow}
                    onDownload={onDownload}
                    onToggleLineNumbers={isMarkdown && previewMode === 'preview' ? undefined : handleToggleLineNumbers}
                    showLineNumbers={showLineNumbers}
                    rightExtra={
                        isMarkdown && (
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant={previewMode === 'preview' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPreviewMode(previewMode === 'source' ? 'preview' : 'source')}
                                    title={
                                        previewMode === 'source'
                                            ? t('component.viewer.toolbar.markdown-preview')
                                            : t('component.viewer.toolbar.markdown-source')
                                    }
                                >
                                    <AiOutlineFileMarkdown className="h-4 w-4" />
                                </Button>
                            </div>
                        )
                    }
                />
                {/* 错误内容 */}
                <div className="flex-1 overflow-auto">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-pink-100 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="h-12 w-12 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                            {t('pages.file-preview.invalid-text.title')}
                        </h3>
                        <p className="text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
                            {t('pages.file-preview.invalid-text.description')}
                        </p>

                        {/* 文件信息卡片 */}
                        {fileInfo && (
                            <div className="bg-muted/50 rounded-lg p-4 mb-6 w-full max-w-md">
                                <div className="flex items-center space-x-3 mb-3">
                                    <File className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium text-foreground">{fileInfo.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">{t('common.type')}:</span>
                                        <span className="ml-2 font-medium">{fileInfo.extension || 'unknown'}</span>
                                    </div>
                                    {fileInfo.size > 0 && (
                                        <div>
                                            <span className="text-muted-foreground">{t('common.file-size')}:</span>
                                            <span className="ml-2 font-medium">
                                                {FormatUtil.formatBytes(fileInfo.size)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" onClick={onReturn} className="px-6">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('common.back')}
                            </Button>
                            <Button onClick={onDownload} className="px-6">
                                <Download className="h-4 w-4 mr-2" />
                                {t('pages.file-preview.download-file')}
                            </Button>
                        </div>

                        {/* 提示信息 */}
                        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-800">
                                    <p className="font-medium mb-1">{t('pages.file-preview.invalid-text.tip-title')}</p>
                                    <p className="text-red-700">
                                        {t('pages.file-preview.invalid-text.tip-description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-h-[600px] flex flex-col relative">
            {/* 工具栏组件 */}
            <TextViewerToolbar
                currentPath={currentPath}
                onReturn={onReturn}
                onNewWindow={onNewWindow}
                onDownload={onDownload}
                onToggleLineNumbers={isMarkdown && previewMode === 'preview' ? undefined : handleToggleLineNumbers}
                showLineNumbers={showLineNumbers}
                rightExtra={
                    isMarkdown && (
                        <div className="flex items-center space-x-1">
                            <Button
                                variant={previewMode === 'preview' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setPreviewMode(previewMode === 'source' ? 'preview' : 'source')}
                                title={
                                    previewMode === 'source'
                                        ? t('component.viewer.toolbar.markdown-preview')
                                        : t('component.viewer.toolbar.markdown-source')
                                }
                            >
                                <AiOutlineFileMarkdown className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                }
            />
            {/* 文本内容 */}
            <div className="flex-1 overflow-auto">
                {displayText ? (
                    isMarkdown && previewMode === 'preview' ? (
                        <div
                            className={`markdown-body vscode-markdown ${document.documentElement.classList.contains('dark') ? 'vscode-dark' : 'vscode-light'} px-4 py-2`}
                            style={{ fontSize: '15px', lineHeight: '1.7' }}
                        >
                            <ReactMarkdown>{displayText}</ReactMarkdown>
                            {isLongText && !showFullText && (
                                <div className="flex justify-center mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setShowFullText(true)}>
                                        {t('component.viewer.show-more')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ShikiHighlighter
                            key={themeVersion}
                            code={displayText}
                            language={safeLanguage}
                            theme={shikiTheme}
                            className="shiki px-4 py-2"
                            style={{ width: '100%', height: '100%', fontSize: '14px', lineHeight: '1.5', margin: 0 }}
                            showLineNumbers={showLineNumbers}
                        />
                    )
                ) : (
                    ((() => {
                        console.log('[TextViewer] 正在加载或无内容', { fileInfo })
                        return null
                    })(),
                    (
                        <>
                            <LogoLoading />
                            <div className="text-center mt-2">
                                <span className="text-sm text-muted-foreground font-medium">
                                    {t('component.viewer.loading')}
                                </span>
                            </div>
                        </>
                    ))
                )}
            </div>
        </div>
    )
}

export default TextViewer
