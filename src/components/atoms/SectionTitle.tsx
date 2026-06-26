import React from 'react'

interface SectionTitleProps {
  children: string
  /** Color of the decorative bar (line below the title) */
  accentColor?: string
  /** Show decorative bar? (default: true) */
  showAccent?: boolean
}

/** Section title (h3) with optional decorative bar. */
const SectionTitle: React.FC<SectionTitleProps> = React.memo(
  ({ children, accentColor, showAccent = true }) => {
    return (
      <h3
        className="mb-3 text-lg font-semibold dark:text-white/90 text-black/85"
      >
        {children}
        {showAccent && accentColor && (
          <span
            className="ml-2 inline-block h-0.5 w-8 rounded-full align-middle"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </h3>
    )
  },
)

SectionTitle.displayName = 'SectionTitle'
export default SectionTitle
