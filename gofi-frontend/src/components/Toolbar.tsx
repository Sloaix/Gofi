import { RiArrowLeftLine, RiDownload2Line, RiFolder3Line, RiHome4Line, RiUploadFill } from '@hacknug/react-icons/ri'
import classNames from 'classnames'
import React from 'react'
import Button from './Button'
import Tooltip from './Tooltip'
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
}

const defualtProps: IProps = {
    downloadIcon: false,
    uploadIcon: false,
    filePathVisible: false,
}

const Toolbar: React.FC<IProps> = (props) => {
    const dashBorderClass =
        'h-8 flex items-center leading-none px-2 border-dashed border border-gra-300 text-sm font-medium rounded text-gray-500 bg-white'
    return (
        <div className="flex space-x-2">
            {/* home icon */}
            {props.homeIcon ? (
                <Tooltip title="根目录">
                    <Button
                        icon={<RiHome4Line />}
                        onClick={() => {
                            props.onHomeClick!()
                        }}
                    />
                </Tooltip>
            ) : null}

            {/* arrow right icon */}
            {props.backIcon ? (
                <Tooltip title="上级目录">
                    <Button
                        icon={<RiArrowLeftLine />}
                        onClick={() => {
                            props.onBackClick!()
                        }}
                    />
                </Tooltip>
            ) : null}

            {/* file size */}
            {props.fileSizeText ? <div className={dashBorderClass}>文件大小:{props.fileSizeText}</div> : null}

            {/* file path */}
            {props.filePathVisible ? (
                <div className={classNames(dashBorderClass, 'flex-grow')}>
                    <RiFolder3Line className="mr-2 text-base mb-[0.1rem]" />
                    {props.filePath}
                </div>
            ) : null}

            {/* plcaeholder for right icon */}
            {!props.filePathVisible ? <div className="flex-grow" /> : null}

            {/* download icon  */}
            {props.downloadIcon ? (
                <Tooltip title="下载">
                    <Button
                        icon={<RiDownload2Line />}
                        onClick={() => {
                            props.onDownloadClick!()
                        }}
                    />
                </Tooltip>
            ) : null}
            {/* right icons end */}
            {props.children}
        </div>
    )
}

Toolbar.defaultProps = defualtProps

export default Toolbar
