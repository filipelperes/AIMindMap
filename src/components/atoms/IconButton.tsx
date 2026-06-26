import React, { type ReactNode } from 'react'

interface IconButtonProps {
  onClick: () => void
  children: ReactNode
  /** Accessible label */
  ariaLabel: string
  /** Size in px (default: 36) */
  size?: number
  /** Additional Tailwind classes */
  className?: string
  /** Disabled? */
  disabled?: boolean
}

/** Generic icon button. Reusable for any action. */
const IconButton: React.FC<IconButtonProps> = React.memo(
  ({ onClick, children, ariaLabel, size = 36, className = '', disabled = false }) => {
    return (
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`flex shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-black/6 dark:bg-white/10 text-black/60 dark:text-white/60 hover:bg-black/15 hover:dark:bg-white/20 hover:text-black hover:dark:text-white ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        {children}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
export default IconButton
