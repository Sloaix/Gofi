import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
    className?: string
    onNext?: () => void
    onPrevious?: () => void
    nextDisable?: boolean
    previousDisable?: boolean
    curPageNumber?: number
    totalPage?: number
    showPageInfo?: boolean
}

const defualtProps: IProps = {
    nextDisable: false,
    previousDisable: false,
    curPageNumber: 1,
    totalPage: 1,
    showPageInfo: true,
}

/**
 * Pagination component
 * @param props
 * @returns
 */
const Pagination: React.FC<IProps> = (props) => {
    const { t } = useTranslation()
    const {
        className,
        onNext,
        onPrevious,
        nextDisable = false,
        previousDisable = false,
        curPageNumber = 1,
        totalPage = 1,
        showPageInfo = true
    } = props

    return (
        <div className={classNames('flex items-center justify-between space-x-2', className)}>
            {showPageInfo && (
                <div className="text-sm text-muted-foreground">
                    {t('component.pagination.page-info', { current: curPageNumber, total: totalPage })}
                </div>
            )}
            
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    disabled={previousDisable}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {showPageInfo && (
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-medium">
                        {curPageNumber}
                    </div>
                )}
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNext}
                    disabled={nextDisable}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

Pagination

export default Pagination
