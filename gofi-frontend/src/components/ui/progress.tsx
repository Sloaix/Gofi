import * as React from 'react'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ value = 0, max = 100, className, ...props }, ref) => {
  return (
    <div ref={ref} className={`relative w-full h-2 bg-muted rounded ${className ?? ''}`} {...props}>
      <div
        className="absolute left-0 top-0 h-2 bg-primary rounded transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
})
Progress.displayName = 'Progress' 