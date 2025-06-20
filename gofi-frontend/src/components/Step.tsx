import { CheckCircle, Circle, MinusCircle, AlertCircle, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import classNames from 'classnames'
import React from 'react'

interface Step {
    title: string
    active?: boolean
    finish?: boolean
    error?: boolean
    description?: string
}

interface IProps {
    steps: Array<Step>
    currentStep?: number
    onStepClick?: (index: number) => void
    showStepNumbers?: boolean
    variant?: 'default' | 'vertical' | 'compact' | 'center'
    className?: string
}

const Step: React.FC<IProps> = ({
    steps,
    currentStep = 0,
    onStepClick,
    showStepNumbers = true,
    variant = 'default',
    className
}) => {
    const getStepIcon = (step: Step, index: number) => {
        if (step.error) {
            return <AlertCircle className="h-4 w-4 text-destructive" />
        }
        if (step.finish) {
            return <Check className="h-4 w-4 text-primary" />
        }
        if (step.active || index === currentStep) {
            return <MinusCircle className="h-4 w-4 text-primary" />
        }
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }

    const getStepStatus = (step: Step, index: number) => {
        if (step.error) return 'error'
        if (step.finish) return 'complete'
        if (step.active || index === currentStep) return 'current'
        return 'pending'
    }

    const isClickable = onStepClick && typeof onStepClick === 'function'

    const renderStep = (step: Step, index: number) => {
        const status = getStepStatus(step, index)
        const isLast = index === steps.length - 1

        return (
            <div
                key={index}
                className={classNames(
                    'flex items-center',
                    variant === 'vertical' ? 'flex-col' : 
                    variant === 'center' ? 'flex-shrink-0' : 'flex-1',
                    isClickable && 'cursor-pointer'
                )}
                onClick={() => isClickable && onStepClick(index)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        onStepClick(index)
                    }
                }}
                aria-label={isClickable ? `Go to step ${index + 1}: ${step.title}` : undefined}
            >
                {/* Step Circle */}
                <div className="flex items-center justify-center">
                    <div
                        className={classNames(
                            'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                            {
                                'border-primary bg-primary text-primary-foreground': status === 'current',
                                'border-primary bg-primary/10 text-primary': status === 'complete',
                                'border-destructive bg-destructive/10 text-destructive-foreground': status === 'error',
                                'border-muted bg-background text-muted-foreground': status === 'pending',
                            }
                        )}
                    >
                        {showStepNumbers && !step.finish && !step.error ? (
                            <span className="text-xs font-medium">{index + 1}</span>
                        ) : (
                            getStepIcon(step, index)
                        )}
                    </div>
                </div>

                {/* Step Content */}
                <div className={classNames(
                    'flex flex-col',
                    variant === 'default' ? 'ml-3' : 
                    variant === 'center' ? 'ml-2' : 'mt-2 text-center',
                    variant === 'compact' && 'ml-2'
                )}>
                    <div className="flex items-center gap-2">
                        <span
                            className={classNames(
                                'text-sm font-medium transition-colors',
                                {
                                    'text-primary': status === 'current' || status === 'complete',
                                    'text-destructive': status === 'error',
                                    'text-muted-foreground': status === 'pending',
                                }
                            )}
                        >
                            {step.title}
                        </span>
                        {step.error && (
                            <Badge variant="destructive" className="text-xs">
                                Error
                            </Badge>
                        )}
                    </div>
                    {step.description && (
                        <span className="text-xs text-muted-foreground mt-1">
                            {step.description}
                        </span>
                    )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                    <div
                        className={classNames(
                            'transition-colors',
                            variant === 'vertical' ? 'w-0.5 h-8 mt-2' : 
                            variant === 'center' ? 'w-12 h-0.5 mx-2' : 'flex-1 h-0.5 ml-3',
                            {
                                'bg-primary': status === 'complete',
                                'bg-muted': status === 'pending' || status === 'current',
                            }
                        )}
                    />
                )}
            </div>
        )
    }

    return (
        <div
            className={classNames(
                'flex items-center',
                variant === 'vertical' ? 'flex-col space-y-4' : 
                variant === 'center' ? 'justify-center' : 'w-full',
                className
            )}
            role="list"
            aria-label="Progress steps"
        >
            {steps.map(renderStep)}
        </div>
    )
}

export default Step
