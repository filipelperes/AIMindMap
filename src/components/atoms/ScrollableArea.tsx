import React, { type ReactNode } from 'react'

interface ScrollableAreaProps {
  children: ReactNode
  /** Classes Tailwind adicionais */
  className?: string
  /** Altura máxima (ex: 'full' para flex-1) */
  fullHeight?: boolean
}

/** Área com scrollbar customizada (thin scrollbar estilo macOS). */
const ScrollableArea: React.FC<ScrollableAreaProps> = React.memo(
  ({ children, className = '', fullHeight = true }) => {
    return (
      <div
        className={`overflow-y-auto pr-1 scrollbar-thin ${
          fullHeight ? 'flex-1' : ''
        } ${className}`}
      >
        {children}
      </div>
    )
  },
)

ScrollableArea.displayName = 'ScrollableArea'
export default ScrollableArea
