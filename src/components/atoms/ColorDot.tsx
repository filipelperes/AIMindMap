import React from 'react'

interface ColorDotProps {
  /** Base color (e.g. palette.base) */
  color: string
  /** Glow color (e.g. palette.emissive) */
  glowColor?: string
  /** Size in px (default: 12) */
  size?: number
  /** Accessible label */
  label?: string
}

/** Colorful circle with emissive glow. Used as a visual group indicator. */
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
