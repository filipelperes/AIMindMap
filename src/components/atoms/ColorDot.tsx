import React from 'react'

interface ColorDotProps {
  /** Cor base (ex: palette.base) */
  color: string
  /** Cor do glow (ex: palette.emissive) */
  glowColor?: string
  /** Tamanho em px (default: 12) */
  size?: number
  /** Label acessível */
  label?: string
}

/** Círculo colorido com glow emissivo. Usado como indicador visual de grupo. */
const ColorDot: React.FC<ColorDotProps> = React.memo(
  ({ color, glowColor, size = 12, label }) => {
    return (
      <span
        role="img"
        aria-label={label}
        className="inline-block shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: glowColor ? `0 0 ${size * 0.8}px ${glowColor}` : undefined,
        }}
      />
    )
  },
)

ColorDot.displayName = 'ColorDot'
export default ColorDot
