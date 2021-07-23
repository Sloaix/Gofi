import React, { useEffect, useState } from 'react'

interface IProps {
    progress?: number
    totalProgress?: number
}

const defualtProps: IProps = {
    progress: 12.5,
    totalProgress: 100,
}

const ProgressBar: React.FC<IProps> = (props) => {
    const [progress, setProgress] = useState<number>(0)

    useEffect(() => {
        setProgress((props.progress! / props.totalProgress!) * 100)
    }, [props.progress])

    return (
        <div className="flex flex-row items-center justify-center space-x-3">
            <div className="flex-grow h-1 relative">
                <div className="h-full w-full bg-indigo-100 rounded-full absolute top-0 left-0"></div>
                <div
                    className="h-full bg-indigo-500 rounded-full absolute top-0 left-0"
                    style={{ width: `${progress.toFixed(0)}%` }}
                ></div>
            </div>
            <div className="text-sm text-gray-700">{progress.toFixed(0)} %</div>
        </div>
    )
}

ProgressBar.defaultProps = defualtProps

export default ProgressBar
