import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import ColorDot from '../atoms/ColorDot'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
/** Renders related-links section as a list of links. */
const SectionLinkList: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.items && section.items.length > 0 && (
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm dark:text-zinc-300 text-zinc-700">
                <ColorDot color={groupColor} size={8} />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)

SectionLinkList.displayName = 'SectionLinkList'

// Auto-registration
registerRenderer('related-links', SectionLinkList)

export default SectionLinkList
