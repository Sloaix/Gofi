import { MdFileDownload } from '@hacknug/react-icons/md'
import { RiFolder3Line, RiLoader2Line } from '@hacknug/react-icons/ri'
import _ from 'lodash'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import repo, { FileInfo } from '../api/repository'
import { FormatUtil } from '../utils/format.util'
import MimeTypeUtil from '../utils/mimetype.util'
import Pagination from './Pagination'
import Tooltip from './Tooltip'

interface IProps {
    items: FileInfo[] | undefined
    onFileNameClick?: (fileinfo: FileInfo) => void
    pageSize?: number //
    emptyView: React.ReactNode
}

const defualtProps: IProps = {
    pageSize: 10,
    items: [],
    emptyView: <></>,
    onFileNameClick: (fileinfo: FileInfo) => {},
}

const List: React.FC<IProps> = ({ items, pageSize, onFileNameClick, emptyView }) => {
    const pageStore = useLocalObservable(() => ({
        orginalItems: [] as FileInfo[],
        pageItems: [] as FileInfo[][],
        curPageIndex: 0,
        isLoading: true,
        onFileNameClick: (fileinfo: FileInfo) => {},
        init(orginalItems: FileInfo[] | undefined, pageSize: number, onFileNameClick: (fileinfo: FileInfo) => void) {
            if (!orginalItems) {
                return
            }
            this.isLoading = false
            this.orginalItems = orginalItems
            this.pageItems = _.chunk(orginalItems, pageSize)
            this.onFileNameClick = onFileNameClick
            this.curPageIndex = 0
        },
        get totalCount() {
            return this.orginalItems.length
        },
        get totalPage() {
            return this.pageItems.length
        },
        get curPageNumber() {
            return this.curPageIndex + 1
        },
        get curPageItems() {
            if (this.totalCount <= 0) {
                return []
            }

            return this.pageItems[this.curPageIndex]
        },
        get hasNext() {
            return this.curPageIndex < this.totalPage - 1
        },
        get hasPrevious() {
            return this.curPageIndex > 0
        },
        nextPage() {
            if (this.hasNext) {
                this.curPageIndex += 1
            }
        },
        previousPage() {
            if (this.hasPrevious) {
                this.curPageIndex -= 1
            }
        },
        get renderListItems() {
            return this.curPageItems.map((item, index) => {
                return (
                    <tr className="text-sm leading-3 text-gray-600 hover:bg-gray-50 transition-all" key={index}>
                        {/* FileName */}
                        <td
                            className="transition-all px-6 py-4 cursor-pointer whitespace-nowrap hover:text-indigo-500"
                            onClick={() => {
                                this.onFileNameClick(item)
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
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                            {FormatUtil.formatBytes(item.size)}
                        </td>
                        {/* LastUpdate */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            {FormatUtil.formatTime(item.lastModified * 1000)}
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium cursor-pointer">
                            <a
                                href={repo.getFileDownloadUrl(item.path)}
                                className="transition-all text-gray-500 hover:text-gray-900"
                            >
                                <Tooltip title="下载">
                                    <MdFileDownload />
                                </Tooltip>
                            </a>
                        </td>
                    </tr>
                )
            })
        },
    }))

    useEffect(() => {
        pageStore.init(items, pageSize!, onFileNameClick!)
    }, [items])

    const listHeader = (
        <thead>
            <tr>
                <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    文件名
                </th>
                <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    大小
                </th>
                <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    最后修改时间
                </th>
                <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="transition-all bg-white shadow-sm overflow-hidden border border-gray-200 rounded-lg hover:shadow-md">
                            {!pageStore.isLoading ? (
                                pageStore.totalCount > 0 ? (
                                    <>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            {listHeader}
                                            <tbody className="divide-y divide-gray-200">
                                                {pageStore.renderListItems}
                                            </tbody>
                                        </table>
                                        <Pagination
                                            className="float-right"
                                            totalPage={pageStore.totalPage}
                                            curPageNumber={pageStore.curPageNumber}
                                            nextDisable={!pageStore.hasNext}
                                            previousDisable={!pageStore.hasPrevious}
                                            onNext={pageStore.nextPage}
                                            onPrevious={() => {
                                                pageStore.previousPage()
                                            }}
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

export default observer(List)
