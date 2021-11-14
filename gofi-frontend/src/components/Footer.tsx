import React from 'react'
import useSWR from 'swr'
import { fetchConfiguration } from '../api/repository'
import QueryKey from '../constants/swr'

const Footer: React.FC = () => {
    const { data: config } = useSWR(QueryKey.CONFIG, () => fetchConfiguration())

    return (
        <>
            <div className="flex flex-col items-center p-4">
                <ul className="flex flex-row space-x-10 text-gray-600 font-base text-sm">
                    <li>
                        <a href="https://github.com/Sloaix/Gofi" className="transition-all hover:text-indigo-500">
                            Github
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://gofi.calmlyfish.com"
                            className="transition-all hover:text-indigo-500 hover:underline"
                        >
                            About
                        </a>
                    </li>
                </ul>
                <div className="text-gray-500 text-sm p-2 flex space-x-2">
                    <span>version {config?.version}</span>
                    <span>©</span>
                    <span>2019-present</span>
                    <a
                        href="https://gofi.calmlyfish.com"
                        className="transition-all hover:text-indigo-500 hover:underline"
                    >
                        gofi.calmlyfish.com
                    </a>
                </div>
            </div>
        </>
    )
}

export default Footer
