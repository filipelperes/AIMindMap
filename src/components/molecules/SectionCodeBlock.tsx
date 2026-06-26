import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
/** Renders a code-example section with code block and copy button. */
const SectionCodeBlock: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(() => {
      if (section.code?.source) {
        navigator.clipboard.writeText(section.code.source).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }
    }, [section.code?.source])

    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        <div className="relative">
          {section.code?.language && (
            <div
              className="absolute left-3 top-2 z-10 rounded px-2 py-0.5 text-[10px] font-medium dark:text-zinc-500 text-zinc-400 dark:bg-black/40 bg-black/3"
            >
              {section.code.language}
            </div>
          )}
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 z-10 rounded px-2 py-1 text-[10px] transition-colors dark:text-zinc-500 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600"
            aria-label={copied ? t('codeBlock.copiedAriaLabel') : t('codeBlock.copyAriaLabel')}
          >
            {copied ? t('codeBlock.copied') : t('codeBlock.copy')}
          </button>
          <pre
            className="overflow-x-auto rounded-xl p-4 pt-8 text-xs leading-relaxed dark:text-cyan-100 text-cyan-700 dark:bg-black/60 bg-black/3"
          >
            <code>{section.code?.source}</code>
          </pre>
        </div>
        {section.body && (
          <p className="mt-2 text-xs dark:text-zinc-400 text-zinc-600">{section.body}</p>
        )}
      </div>
    )
  },
)

SectionCodeBlock.displayName = 'SectionCodeBlock'

// Auto-registration
registerRenderer('code-example', SectionCodeBlock)

export default SectionCodeBlock
