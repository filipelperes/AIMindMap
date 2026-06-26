import React from 'react'
import { useTranslation } from 'react-i18next'

interface CloseButtonProps {
  onClick: () => void
  /** Accessible label (default: translation of 'closeButton.ariaLabel') */
  ariaLabel?: string
  /** Size in px (default: 32) */
  size?: number
}

/** Circular X button to close panels. Extracted from the original inline SVG. */
const CloseButton: React.FC<CloseButtonProps> = React.memo(
  ({ onClick, ariaLabel, size = 32 }) => {
    const { t } = useTranslation()
    const label = ariaLabel ?? t('closeButton.ariaLabel')
    const iconSize = Math.round(size * 0.44)

    return (
      <button
        onClick={onClick}
        aria-label={label}
        className="flex shrink-0 items-center justify-center rounded-full transition-colors bg-black/6 dark:bg-white/10 text-black/60 dark:text-white/60 hover:bg-black/15 hover:dark:bg-white/20 hover:text-black hover:dark:text-white"
        style={{ width: size, height: size, minWidth: size }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1L13 13M13 1L1 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    )
  },
)

CloseButton.displayName = 'CloseButton'
export default CloseButton
