import React from 'react'
import { ListOrdered, Download, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import ViewerToolbar, { ViewerToolbarProps } from './ViewerToolbar'
import { cn } from '@/lib/utils'

interface TextViewerToolbarProps extends ViewerToolbarProps {
  onToggleLineNumbers?: () => void
  showLineNumbers?: boolean
  rightExtra?: React.ReactNode
  onDownload?: () => void
  onNewWindow?: () => void
}

const TextViewerToolbar: React.FC<TextViewerToolbarProps> = ({
  onToggleLineNumbers,
  showLineNumbers,
  rightExtra,
  onDownload,
  onNewWindow,
  ...props
}) => {
  const { t } = useTranslation()

  return (
    <ViewerToolbar {...props} onDownload={onDownload} onNewWindow={onNewWindow}>
      {/* 行号切换按钮 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleLineNumbers}
              className={cn('h-8 w-8 p-0', showLineNumbers && 'bg-accent text-accent-foreground')}
              disabled={!onToggleLineNumbers}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t(showLineNumbers ? 'component.viewer.toolbar.hide-line-numbers' : 'component.viewer.toolbar.show-line-numbers')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {rightExtra}
    </ViewerToolbar>
  )
}

export default TextViewerToolbar 