import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'

/**
 * Molécula que renderiza uma lista de perguntas e respostas (QA).
 * Ideal para seções de entrevistas e troubleshooting.
 */
const SectionQAList: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    if (!section.qa || section.qa.length === 0) {
      return (
        <div className="space-y-3">
          <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
          {section.body && <p className="text-sm leading-relaxed text-zinc-300">{section.body}</p>}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="text-sm leading-relaxed text-zinc-300">{section.body}</p>
        )}
        <div className="space-y-3">
          {section.qa.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/5 bg-white/[0.02] transition-all hover:border-white/10"
            >
              <summary className="flex cursor-pointer items-start gap-3 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: `${groupColor}20`,
                    color: groupColor,
                  }}
                >
                  Q
                </span>
                <span className="flex-1">{item.question}</span>
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <div className="border-t border-white/5 px-4 py-3">
                <div className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: `${groupColor}10`,
                      color: groupColor,
                    }}
                  >
                    A
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {item.answer}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    )
  },
)

SectionQAList.displayName = 'SectionQAList'
registerRenderer('qa-list', SectionQAList)

export default SectionQAList
