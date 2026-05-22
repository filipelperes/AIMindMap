import React from 'react'

interface SectionTitleProps {
  children: string
  /** Cor da barra decorativa (linha abaixo do título) */
  accentColor?: string
  /** Mostrar barra decorativa? (default: true) */
  showAccent?: boolean
}

/** Título de seção (h3) com barra decorativa opcional. */
const SectionTitle: React.FC<SectionTitleProps> = React.memo(
  ({ children, accentColor, showAccent = true }) => {
    return (
      <h3 className="mb-3 text-lg font-semibold text-white/90">
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
