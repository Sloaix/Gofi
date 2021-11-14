import { RiRefreshLine, RiUploadFill } from '@hacknug/react-icons/ri'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useSWR from 'swr'
import repo, { fetchFileList, FileInfo } from '../../api/repository'
import NotFoundImage from '../../assets/404.svg'
import Button from '../../components/Button'
import Exception from '../../components/Exception'
import MainLayout from '../../components/layouts/MainLayout/Index'
import List from '../../components/List'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Tip from '../../components/Tip'
import Toolbar from '../../components/Toolbar'
import Tooltip from '../../components/Tooltip'
import Upload from '../../components/Upload'
import QueryKey from '../../constants/swr'
import EnvUtil from '../../utils/env.util'
import MimeTypeUtil from '../../utils/mimetype.util'
import TextUtil from '../../utils/text.util'
import Toast from '../../utils/toast.util'
import UrlUtil from '../../utils/url.util'

const FileViewer: React.FC = (props) => {
    const location = useLocation()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const uploadRef = useRef<HTMLInputElement>(null)
    const [searchParams] = useSearchParams()
    const [currentPath, setCurrentPath] = useState<string>()
    const [pathPram, setPathParam] = useState<string>()
    const [showProgressModel, setShowProgressModel] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [uploadModalMessage, setUploadModalMessage] = useState<React.ReactNode>(null)
    const {
        data: fileInfos,
        error,
        mutate,
    } = useSWR(currentPath ? [QueryKey.FILE_LIST, currentPath] : null, (_, dir) => fetchFileList(dir))

    const fetching = !fileInfos && !error

    // ?path=/a/b/c , parent is  /a/b
    const parentPathOfpathQuery = () => {
        if (TextUtil.isEmpty(pathPram)) {
            return ''
        }
        return UrlUtil.parentPath(pathPram)
    }

    // 是否还有上级目录
    const hasParentDirectory = () => {
        return TextUtil.isNotEmpty(parentPathOfpathQuery())
    }

    useEffect(() => {
        if (searchParams) {
            const newPathParam = searchParams.get('path') ?? ''
            setPathParam(newPathParam)
            if (TextUtil.isEmpty(newPathParam)) {
                setCurrentPath('/')
            } else {
                setCurrentPath(newPathParam)
            }
        }
    }, [searchParams])

    /**
     * 文件被点击
     * @param fileinfo
     * @returns
     */
    const onFileNameClick = (fileinfo: FileInfo): void => {
        let pathWithQuery
        if (fileinfo.isDirectory) {
            // 给当前的pathname加上path的query
            pathWithQuery = UrlUtil.attachQueryTo(location.pathname, {
                path: TextUtil.withPrefix(fileinfo.path, '/'),
            })
        } else {
            // 导航到详情页面
            // 给当前的pathname加上path的query
            pathWithQuery = UrlUtil.attachQueryTo('/file/detail', {
                path: TextUtil.withPrefix(fileinfo.path, '/'),
            })
        }
        navigate(pathWithQuery)
    }

    /**
     * 导航到根目录
     */
    const navigateToRootDirectory = () => {
        if (!hasParentDirectory()) {
            Toast.i(t('toast.already-root-dir'))
            return
        }
        navigate(location.pathname)
    }

    /**
     * 导航到上级目录
     */
    const navigateToParentDirectory = () => {
        if (!hasParentDirectory()) {
            Toast.i(t('toast.already-root-dir'))
            return
        }

        const url =
            parentPathOfpathQuery() === '/'
                ? location.pathname
                : UrlUtil.attachQueryTo(location.pathname, { path: parentPathOfpathQuery() })

        navigate(url)
    }

    /**
     * 上传文件
     * @param files
     */
    const onUploadFiles = async (files: File[]) => {
        const dirPath = TextUtil.withPrefix(pathPram, '/')
        setUploadModalMessage(
            <div>
                {files.map((file, index) => {
                    return (
                        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2" key={index}>
                            {MimeTypeUtil.icon(TextUtil.extension(file.name))}
                            <span className="whitespace-nowrap break-words overflow-ellipsis">{file.name}</span>
                        </div>
                    )
                })}
            </div>,
        )
        try {
            setShowProgressModel(true)
            await repo.uploadFiles(dirPath, files, (progress, total) => {
                setUploadProgress((progress / total) * 100)
            })
            mutate()
            Toast.s(t('toast.upload-success'))
        } finally {
            setShowProgressModel(false)
        }
    }

    return (
        <MainLayout>
            <PageHeader title={t('pages.file-viewer.title')} />
            {EnvUtil.isPreviewMode ? (
                <div className="pb-4">
                    <Tip type="warning" message={t('app.tip.preview-mode')} />
                </div>
            ) : null}
            <Toolbar
                homeIcon={true}
                backIcon={true}
                uploadIcon={true}
                filePath={currentPath}
                filePathVisible={true}
                onHomeClick={navigateToRootDirectory}
                onBackClick={navigateToParentDirectory}
            >
                <Tooltip title={t('tooltip.upload')}>
                    <Upload onFileSelected={onUploadFiles} ref={uploadRef}>
                        <Button
                            type="secondary"
                            icon={<RiUploadFill />}
                            onClick={() => {
                                uploadRef.current?.click()
                            }}
                        />
                    </Upload>
                </Tooltip>
                <Tooltip title={t('tooltip.refresh')}>
                    <Button type="secondary" icon={<RiRefreshLine />} onClick={mutate} />
                </Tooltip>
            </Toolbar>
            <List
                items={fileInfos}
                loading={fetching}
                onFileNameClick={onFileNameClick}
                emptyView={
                    <div className="p-6">
                        <Exception
                            title="当前文件夹为空"
                            message="您可以手动上传文件"
                            buttonText="点击上传"
                            onButtonClick={() => {
                                uploadRef.current?.click()
                            }}
                            image={NotFoundImage}
                        />
                    </div>
                }
            />
            <Modal
                show={showProgressModel}
                title="文件上传中,请勿切换或刷新页面"
                message={uploadModalMessage}
                showProgress={true}
                progress={uploadProgress}
            />
        </MainLayout>
    )
}

export default FileViewer
