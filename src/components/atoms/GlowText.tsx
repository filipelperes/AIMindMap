import React, { type ReactNode } from 'react'

interface GlowTextProps {
  children: ReactNode
  /** Cor do glow (CSS color) */
  color?: string
  /** Intensidade do blur (px, default: 8) */
  blur?: number
  /** Tag HTML (default: 'span') */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div'
  /** Classes Tailwind adicionais */
  className?: string
}

/** Texto com efeito de glow neon via text-shadow. */
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
