import { RiArrowLeftLine, RiDownload2Line, RiFolder3Line, RiHome4Line, RiUploadFill } from '@hacknug/react-icons/ri'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    const dashBorderClass =
        'h-8 flex items-center leading-none px-2 border-dashed border border-gra-300 text-sm font-medium rounded text-gray-500 bg-white'
    return (
        <div className="flex space-x-2">
            {/* home icon */}
            {props.homeIcon ? (
                <Tooltip title={t('tooltip.home')}>
                    <Button
                        type="secondary"
                        icon={<RiHome4Line />}
                        onClick={() => {
                            props.onHomeClick!()
                        }}
                    />
                </Tooltip>
            ) : null}

            {/* arrow right icon */}
            {props.backIcon ? (
                <Tooltip title={t('tooltip.back')}>
                    <Button
                        type="secondary"
                        icon={<RiArrowLeftLine />}
                        onClick={() => {
                            props.onBackClick!()
                        }}
                    />
                </Tooltip>
            ) : null}

            {/* file size */}
            {props.fileSizeText ? (
                <div className={dashBorderClass}>
                    {t('toolbar.file-size')}:{props.fileSizeText}
                </div>
            ) : null}

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
                <Tooltip title={t('tooltip.download')}>
                    <Button
                        type="secondary"
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
