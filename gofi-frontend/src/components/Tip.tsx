import { Alert, AlertDescription } from "@/components/ui/alert"
import { RiAlarmWarningLine, RiInformationLine, RiShieldKeyholeLine } from 'react-icons/ri'
import React from 'react'

interface IProps {
    message: string
    type?: 'default' | 'warning' | 'danger'
    className?: string
}

const defualtProps: IProps = {
    message: '',
    type: 'default',
}

const Tip: React.FC<IProps> = ({ message, type = 'default', className }) => {
    const getAlertVariant = () => {
        switch (type) {
            case 'danger':
                return 'destructive'
            case 'warning':
                return 'default'
            default:
                return 'default'
        }
    }

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <RiShieldKeyholeLine className="h-4 w-4" />
            case 'warning':
                return <RiAlarmWarningLine className="h-4 w-4" />
            default:
                return <RiInformationLine className="h-4 w-4" />
        }
    }

    return (
        <div className={className}>
            <Alert variant={getAlertVariant()}>
                {getIcon()}
                <div className="ml-2">
                    <AlertDescription>
                        {message}
                    </AlertDescription>
                </div>
            </Alert>
        </div>
    )
}

Tip

export default Tip
