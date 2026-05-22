import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import ColorDot from '../atoms/ColorDot'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
import { useTheme } from '../../store/ThemeContext'

/** Renderiza seção related-links como lista de links. */
const SectionLinkList: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const { mode } = useTheme()
    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.items && section.items.length > 0 && (
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: mode === 'dark' ? '#D4D4D8' : '#3F3F46' }}>
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

// Auto-registro
registerRenderer('related-links', SectionLinkList)

export default SectionLinkList
