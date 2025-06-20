import React from 'react'
import icon from '../../../assets/logo.svg'
export default () => {
    return (
        <div className="cursor-pointer mr-4 pr-2">
            <img src={icon} className="opacity-80 h-12 w-auto pr-2 py-2 inline-block" />
            <span className="font-medium hidden sm:inline-block text-gray-800 dark:text-gray-200">Go File Indexer</span>
        </div>
    )
}
