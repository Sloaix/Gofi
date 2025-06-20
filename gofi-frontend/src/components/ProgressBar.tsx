import { Progress } from "@/components/ui/progress"
import React, { useEffect, useState } from 'react'

interface IProps {
    progress?: number
    totalProgress?: number
    showPercentage?: boolean
    className?: string
}

const ProgressBar: React.FC<IProps> = ({ 
    progress = 12.5, 
    totalProgress = 100, 
    showPercentage = true,
    className 
}) => {
    const [progressValue, setProgressValue] = useState<number>(0)

    useEffect(() => {
        setProgressValue((progress / totalProgress) * 100)
    }, [progress, totalProgress])

    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            <Progress value={progressValue} className="w-full" />
            {showPercentage && (
                <div className="text-sm text-muted-foreground text-center">
                    {progressValue.toFixed(0)}%
                </div>
            )}
        </div>
    )
}

export default ProgressBar
