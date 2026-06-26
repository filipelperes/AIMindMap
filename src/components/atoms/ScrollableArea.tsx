import React, { type ReactNode } from 'react'

interface ScrollableAreaProps {
  children: ReactNode
  /** Additional Tailwind classes */
  className?: string
  /** Full height (e.g. 'full' for flex-1) */
  fullHeight?: boolean
}

/** Area with custom scrollbar (macOS-style thin scrollbar). */
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
