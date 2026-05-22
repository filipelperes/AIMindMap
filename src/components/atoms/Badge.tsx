import React from 'react'
import ColorDot from './ColorDot'

interface BadgeProps {
  /** Texto do badge (ex: "Retrieval") */
  label: string
  /** Cor base do grupo */
  baseColor: string
  /** Cor do glow */
  glowColor?: string
  /** Cor do texto (accent) */
  textColor?: string
}

/** Badge tipo pill com bolinha colorida + label do grupo. */
const Badge: React.FC<BadgeProps> = React.memo(
  ({ label, baseColor, glowColor, textColor }) => {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{
          backgroundColor: `${baseColor}20`,
          color: textColor ?? baseColor,
          border: `1px solid ${baseColor}40`,
        }}
      >
        <ColorDot color={baseColor} glowColor={glowColor} size={8} />
        {label}
      </span>
    )
  },
)

Badge.displayName = 'Badge'
export default Badge
