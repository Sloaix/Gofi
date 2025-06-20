import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import React from 'react'
import ProgressBar from './ProgressBar'

interface IProps {
    show?: boolean
    buttons?: React.ReactNode[]
    message?: string | React.ReactNode
    title?: string
    showProgress?: boolean
    progress?: number
    totalProgress?: number
    onOpenChange?: (open: boolean) => void
}

const Modal: React.FC<IProps> = (props) => {
    const { show, buttons, message, title, showProgress, progress, totalProgress, onOpenChange } = props

    return (
        <Dialog open={show} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                </DialogHeader>
                
                <div className="space-y-4">
                    {showProgress && (
                        <ProgressBar progress={progress} totalProgress={totalProgress} />
                    )}
                    {message && <div>{message}</div>}
                </div>

                {buttons && (
                    <DialogFooter>
                        <div className="flex flex-row space-x-4 items-center justify-end">
                            {buttons}
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default Modal
