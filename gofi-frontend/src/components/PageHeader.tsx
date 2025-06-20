import React from 'react'

interface IProps {
    icon?: React.ReactNode // 渲染的icon
    title?: string
    description?: string
}

const PageHeader: React.FC<IProps> = ({ icon, title, description }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
                {icon && (
                    <div className="p-2 bg-primary/10 rounded-lg">
                        {icon}
                    </div>
                )}
                <h1 className="text-3xl font-bold text-foreground">
                    {title}
                </h1>
            </div>
            {description && (
                <p className="text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    )
}

export default PageHeader
