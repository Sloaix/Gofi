import { RiArrowLeftLine, RiDownload2Line, RiFolder3Line, RiHome4Line, RiUploadFill } from 'react-icons/ri'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Upload from './Upload'

interface IProps {
    downloadIcon?: boolean
    uploadIcon?: boolean
    homeIcon?: boolean
    backIcon?: boolean
    fileSizeText?: string
    filePath?: string
    filePathVisible?: boolean
    onHomeClick?: () => void
    onBackClick?: () => void
    onDownloadClick?: () => void
    children?: React.ReactNode
}

const Toolbar: React.FC<IProps> = ({
    downloadIcon = false,
    uploadIcon = false,
    homeIcon,
    backIcon,
    fileSizeText,
    filePath,
    filePathVisible = false,
    onHomeClick,
    onBackClick,
    onDownloadClick,
    children,
}) => {
    const { t } = useTranslation()
    const dashBorderClass =
        'h-8 flex items-center leading-none px-2 border-dashed border border-gra-300 text-sm font-medium rounded text-gray-500 bg-white'
    return (
        <div className="bg-card border-b border-border shadow-sm flex items-center justify-between px-4 py-1.5 w-full">
            <div className="flex items-center gap-2">
                {/* home icon */}
                {homeIcon ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        onHomeClick!()
                                    }}
                                >
                                    <RiHome4Line className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('tooltip.home')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : null}

                {/* arrow right icon */}
                {backIcon ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        onBackClick!()
                                    }}
                                >
                                    <RiArrowLeftLine className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('tooltip.back')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : null}

                {/* upload icon */}
                {uploadIcon ? (
                    <>{children}</>
                ) : null}

                {/* file size */}
                {fileSizeText ? (
                    <div className={dashBorderClass}>
                        {t('common.file-size')}:{fileSizeText}
                    </div>
                ) : null}
            </div>

            {/* file path */}
            {filePathVisible && filePath && (
                <div className="text-xs text-muted-foreground truncate ml-4">{filePath}</div>
            )}

            {/* download icon  */}
            {downloadIcon ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    onDownloadClick!()
                                }}
                            >
                                <RiDownload2Line className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('tooltip.download')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : null}
        </div>
    )
}

export default Toolbar
