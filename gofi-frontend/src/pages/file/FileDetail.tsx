import { MdOpenInNew } from '@hacknug/react-icons/md'
import { RiLoader2Line } from '@hacknug/react-icons/ri'
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import repo, { FileInfo } from '../../api/repository'
import previewIsNotSupport from '../../assets/no-data.svg'
import Button from '../../components/Button'
import Exception from '../../components/Exception'
import MainLayout from '../../components/layouts/MainLayout/Index'
import PageHeader from '../../components/PageHeader'
import Toolbar from '../../components/Toolbar'
import Tooltip from '../../components/Tooltip'
import AudioViewer from '../../components/viewer/AudioViewer'
import ImageViewer from '../../components/viewer/ImageViewer'
import PdfViewer from '../../components/viewer/PdfViewer'
import TextViewer from '../../components/viewer/TextViewer'
import VideoViewer from '../../components/viewer/VideoViewer'
import { FormatUtil } from '../../utils/format.util'
import MimeTypeUtil, { PreviewableFileType } from '../../utils/mimetype.util'

const FileDetail: React.FC<RouteComponentProps> = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [downloadUrl, setDownloadUrl] = useState<string>()
    const [previewUrl, setPreviewUrl] = useState<string>()
    const [fileInfo, setFileInfo] = useState<FileInfo>()
    const [previewableFileType, setPreviewableFileType] = useState<PreviewableFileType | null>()

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
                <PageHeader title="文件详情" />
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
                                <Tooltip title="在新标签中打开文件">
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
