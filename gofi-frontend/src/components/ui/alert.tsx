import * as React from 'react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ variant = 'default', className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-md border p-4 ${variant === 'destructive' ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-card text-foreground'} ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  )
})
Alert.displayName = 'Alert'

export const AlertTitle: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="font-semibold mb-1">{children}</div>
)
export const AlertDescription: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="text-sm text-muted-foreground">{children}</div>
) 