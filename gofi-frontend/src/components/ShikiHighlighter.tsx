import React, { useEffect, useState } from 'react'
import type { FC, CSSProperties } from 'react'
import type { BuiltinLanguage, BuiltinTheme } from 'shiki'
import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers'
import { cn } from '@/lib/utils'

interface ShikiHighlighterProps {
  code: string
  language?: BuiltinLanguage | string
  theme?: BuiltinTheme | string
  className?: string
  style?: CSSProperties
  showLineNumbers?: boolean
}

const ShikiHighlighter: FC<ShikiHighlighterProps> = ({
  code,
  language = 'plaintext',
  theme = 'github-light',
  className,
  style,
  showLineNumbers = false,
}) => {
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    let mounted = true
    import('shiki').then(async (shiki) => {
      try {
        const html = await shiki.codeToHtml(code, {
          lang: language,
          theme,
          transformers: [transformerNotationDiff(), transformerNotationHighlight()],
        })
        if (mounted) setHtml(html)
      } catch (err) {
        console.warn('[ShikiHighlighter] 高亮失败，自动降级为 plaintext', { language, err })
        try {
          const html = await shiki.codeToHtml(code, {
            lang: 'plaintext',
            theme,
            transformers: [transformerNotationDiff(), transformerNotationHighlight()],
          })
          if (mounted) setHtml(html)
        } catch (err2) {
          console.error('[ShikiHighlighter] plaintext 也渲染失败', err2)
          if (mounted) setHtml(`<pre>${code}</pre>`)
        }
      }
    })
    return () => {
      mounted = false
    }
  }, [code, language, theme])

  return (
    <div
      className={cn(className, showLineNumbers && 'line-numbers')}
      style={style}
      // shiki默认会输出 <pre class="shiki" ...>，这里直接dangerouslySetInnerHTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default ShikiHighlighter 