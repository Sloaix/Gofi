import { MdOpenInNew } from '@hacknug/react-icons/md'
import { RiLoader2Line } from '@hacknug/react-icons/ri'
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router'
import classNames from 'classnames'
import React, { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import repo, { FileInfo } from '../../api/repository'
import previewIsNotSupport from '../../assets/no-data.svg'
import Button from '../../components/Button'
import Exception from '../../components/Exception'
import MainLayout from '../../components/layouts/MainLayout/Index'
import PageHeader from '../../components/PageHeader'
import Toolbar from '../../components/Toolbar'
import Tooltip from '../../components/Tooltip'
import { FormatUtil } from '../../utils/format.util'
import MimeTypeUtil, { PreviewableFileType } from '../../utils/mimetype.util'

const TextViewer = lazy(() => import('../../components/viewer/TextViewer'))
const AudioViewer = lazy(() => import('../../components/viewer/AudioViewer'))
const ImageViewer = lazy(() => import('../../components/viewer/ImageViewer'))
const PdfViewer = lazy(() => import('../../components/viewer/PdfViewer'))
const VideoViewer = lazy(() => import('../../components/viewer/VideoViewer'))

const FileDetail: React.FC<RouteComponentProps> = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [downloadUrl, setDownloadUrl] = useState<string>()
    const [previewUrl, setPreviewUrl] = useState<string>()
    const [fileInfo, setFileInfo] = useState<FileInfo>()
    const [previewableFileType, setPreviewableFileType] = useState<PreviewableFileType | null>()
    const { t } = useTranslation()

    const pathQuery = () => {
        let searchParams = new URLSearchParams(location.search)
        if (searchParams.has('path')) {
            return searchParams.get('path') ?? ''
        }
        return ''
    }

    useEffect(() => {
        ;(async () => {
            const fileInfo = await repo.fetchFileDetail(pathQuery())
            setFileInfo(fileInfo)
            setDownloadUrl(repo.getFileDownloadUrl(pathQuery()))
            setPreviewUrl(repo.getFilePreviewUrl(pathQuery()))
            setPreviewableFileType(MimeTypeUtil.previewableTypeOf(fileInfo.extension))
        })()
    }, [location.search])

    return (
        <MainLayout>
            <div className={classNames('w-full', { 'h-full flex flex-col flex-grow': 'pdf' === previewableFileType })}>
                <PageHeader title={t('pages.file-detail.title')} />
                <Toolbar
                    filePath={fileInfo?.path}
                    downloadIcon={true}
                    backIcon={true}
                    fileSizeText={FormatUtil.formatBytes(fileInfo?.size ?? 0)}
                    filePathVisible={true}
                    onBackClick={() => {
                        navigate(-1)
                    }}
                    onDownloadClick={() => {
                        console.log(downloadUrl)
                        window.open(downloadUrl, '_blank')
                    }}
                >
                    {(() => {
                        if (previewableFileType as PreviewableFileType) {
                            return (
                                <Tooltip title={t('tooltip.open-file-with-new-tab')}>
                                    <Button
                                        icon={<MdOpenInNew />}
                                        onClick={() => {
                                            window.open(previewUrl, '_blank')
                                        }}
                                    />
                                </Tooltip>
                            )
                        }
                        return null
                    })()}
                </Toolbar>
                <div
                    className={classNames(
                        'bg-white shadow-sm overflow-hidden border border-gray-200 rounded-lg hover:shadow-md mt-2 flex flex-grow items-center justify-center',
                        { 'flex flex-grow': 'pdf' === previewableFileType },
                    )}
                >
                    {fileInfo ? (
                        previewableFileType ? (
                            (() => {
                                switch (previewableFileType) {
                                    case 'pdf':
                                        return <PdfViewer url={previewUrl} />
                                    case 'audio':
                                        return <AudioViewer url={previewUrl} mime={fileInfo.mime} />
                                    case 'image':
                                        return <ImageViewer url={previewUrl} />
                                    case 'text':
                                        return <TextViewer url={previewUrl} language={fileInfo.extension} />
                                    case 'video':
                                        return <VideoViewer url={previewUrl} />
                                }
                            })()
                        ) : (
                            <div className="p-6">
                                <Exception
                                    title="十分抱歉"
                                    message="Gofi不支持该文件的预览"
                                    image={previewIsNotSupport}
                                />
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-4 p-6">
                            <RiLoader2Line className="animate-spin-slow" />
                            <div>加载中</div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

export default FileDetail
