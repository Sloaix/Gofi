import { MdFileDownload } from '@hacknug/react-icons/md'
import { RiFolder3Line, RiLoader2Line } from '@hacknug/react-icons/ri'
import _ from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import repo, { FileInfo } from '../api/repository'
import i18n from '../i18n'
import { FormatUtil } from '../utils/format.util'
import MimeTypeUtil from '../utils/mimetype.util'
import Pagination from './Pagination'
import Tooltip from './Tooltip'

interface IProps {
    items: FileInfo[] | undefined
    onFileNameClick?: (fileinfo: FileInfo) => void
    pageSize?: number //
    loading?: boolean
    emptyView: React.ReactNode
}

const defualtProps: IProps = {
    pageSize: 10,
    loading: false,
    items: [],
    emptyView: <></>,
    onFileNameClick: () => {},
}

const LIST_HEADER = (
    <thead>
        <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {i18n.t('list.file-name')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {i18n.t('list.file-size')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {i18n.t('list.last-modified-time')}
            </th>
            <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
            </th>
        </tr>
    </thead>
)

const List: React.FC<IProps> = ({ items, pageSize, onFileNameClick, emptyView, loading }) => {
    const { t } = useTranslation()
    const [curPageIndex, setCurPageIndex] = React.useState(0)
    const [itemsGroupByPage, setItemsGroupByPage] = React.useState<FileInfo[][]>()

    useEffect(() => {
        if (items) {
            setItemsGroupByPage(_.chunk(items, pageSize))
        }
    }, [items])

    const totalCount = () => {
        return items?.length ?? 0
    }

    const totalPage = () => {
        return itemsGroupByPage?.length ?? 0
    }
    const curPageNumber = () => {
        return curPageIndex + 1
    }

    const curPageItems = () => {
        if (totalCount() <= 0) {
            return []
        }

        return itemsGroupByPage?.[curPageIndex] ?? []
    }

    const hasNext = () => {
        return curPageIndex < totalPage() - 1
    }

    const hasPrevious = () => {
        return curPageIndex > 0
    }

    const nextPage = () => {
        if (hasNext()) {
            const newValue = curPageIndex + 1
            setCurPageIndex(newValue)
        }
    }
    const previousPage = () => {
        if (hasPrevious()) {
            const newValue = curPageIndex - 1
            setCurPageIndex(newValue)
        }
    }

    const renderListItems = () => {
        return curPageItems().map((item, index) => {
            return (
                <tr className="text-sm leading-3 text-gray-600 hover:bg-gray-50 transition-all" key={index}>
                    {/* FileName */}
                    <td
                        className="transition-all px-6 py-4 cursor-pointer whitespace-nowrap hover:text-indigo-500"
                        onClick={() => {
                            if (onFileNameClick) {
                                onFileNameClick(item)
                            }
                        }}
                    >
                        <div className="inline-flex items-center">
                            <span className="mb-[0.15rem] mr-1 text-xl">
                                {item.isDirectory ? <RiFolder3Line /> : MimeTypeUtil.icon(item.extension)}
                            </span>
                            <span> {item.name}</span>
                        </div>
                    </td>
                    {/* FileSize */}
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer">{FormatUtil.formatBytes(item.size)}</td>
                    {/* LastUpdate */}
                    <td className="px-6 py-4 whitespace-nowrap">{FormatUtil.formatTime(item.lastModified * 1000)}</td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium cursor-pointer">
                        <a
                            href={repo.getFileDownloadUrl(item.path)}
                            className="transition-all text-gray-500 hover:text-gray-900"
                        >
                            <Tooltip title={t('tooltip.download')}>
                                <MdFileDownload />
                            </Tooltip>
                        </a>
                    </td>
                </tr>
            )
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="transition-all bg-white shadow-sm overflow-hidden border border-gray-200 rounded-lg hover:shadow-md">
                            {!loading ? (
                                totalCount() > 0 ? (
                                    <>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            {LIST_HEADER}
                                            <tbody className="divide-y divide-gray-200">{renderListItems()}</tbody>
                                        </table>
                                        <Pagination
                                            className="float-right"
                                            totalPage={totalPage()}
                                            curPageNumber={curPageNumber()}
                                            nextDisable={!hasNext()}
                                            previousDisable={!hasPrevious()}
                                            onNext={nextPage}
                                            onPrevious={previousPage}
                                        />
                                    </>
                                ) : (
                                    emptyView
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-4 p-6">
                                    <RiLoader2Line className="animate-spin-slow" />
                                    <div>加载中</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

List.defaultProps = defualtProps

export default List
