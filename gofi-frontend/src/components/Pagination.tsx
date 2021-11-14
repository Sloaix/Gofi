import { BiChevronLeft, BiChevronRight } from '@hacknug/react-icons/bi'
import classNames from 'classnames'
import React from 'react'
import Button from './Button'

interface IProps {
    className?: string
    onNext?: () => void
    onPrevious?: () => void
    nextDisable?: boolean
    previousDisable?: boolean
    curPageNumber?: number
    totalPage?: number
}

const defualtProps: IProps = {
    nextDisable: false,
    previousDisable: false,
    curPageNumber: 1,
    totalPage: 1,
}

/**
 * 分页组件
 * @param props
 * @returns
 */
const Pagination: React.FC<IProps> = (props) => {
    return (
        <div className={classNames('flex space-x-2 p-2', props.className)}>
            <Button type="secondary">
                {props.curPageNumber}/{props.totalPage}
            </Button>
            <Button icon={<BiChevronLeft />} disabled={props.previousDisable} onClick={props.onPrevious} />
            <Button icon={<BiChevronRight />} disabled={props.nextDisable} onClick={props.onNext} />
        </div>
    )
}

Pagination.defaultProps = defualtProps

export default Pagination
