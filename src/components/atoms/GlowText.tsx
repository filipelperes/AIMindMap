import React, { type ReactNode } from 'react'

interface GlowTextProps {
  children: ReactNode
  /** Glow color (CSS color) */
  color?: string
  /** Blur intensity (px, default: 8) */
  blur?: number
  /** Tag HTML (default: 'span') */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div'
  /** Additional Tailwind classes */
  className?: string
}

/** Text with neon glow effect via text-shadow. */
const GlowText: React.FC<GlowTextProps> = React.memo(
  ({ children, color = '#00FFF0', blur = 8, as: Tag = 'span', className = '' }) => {
    return (
      <Tag
        className={className}
        style={{
          textShadow: `0 0 ${blur}px ${color}, 0 0 ${blur * 2}px ${color}40`,
        }}
      >
        {children}
      </Tag>
    )
  },
)

GlowText.displayName = 'GlowText'
export default GlowText
