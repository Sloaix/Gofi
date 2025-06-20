import { MdFileDownload } from 'react-icons/md'
import { RiFolder3Line, RiLoader2Line } from 'react-icons/ri'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import repo, { FileInfo } from '../api/repository'
import i18n from '../i18n'
import { FormatUtil } from '../utils/format.util'
import MimeTypeUtil from '../utils/mimetype.util'
import Pagination from './Pagination'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                {i18n.t('common.file-name')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                {i18n.t('common.file-size')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                {i18n.t('common.last-modified')}
            </th>
            <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
            </th>
        </tr>
    </thead>
)

function chunk<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size));
    }
    return res;
}

const List: React.FC<IProps> = ({ items, pageSize, onFileNameClick, emptyView, loading }) => {
    const { t } = useTranslation()
    const [curPageIndex, setCurPageIndex] = React.useState(0)
    const [itemsGroupByPage, setItemsGroupByPage] = React.useState<FileInfo[][]>()

    useEffect(() => {
        if (items) {
            setItemsGroupByPage(chunk(items, Number(pageSize)))
        }
    }, [items, pageSize])

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
                        className="transition-all px-6 py-4 cursor-pointer whitespace-nowrap hover:text-primary"
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
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <MdFileDownload />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('tooltip.download')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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

List

export default List
