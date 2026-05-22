import React from 'react'

interface CloseButtonProps {
  onClick: () => void
  /** Label acessível (default: "Fechar") */
  ariaLabel?: string
  /** Tamanho em px (default: 32) */
  size?: number
}

/** Botão X circular para fechar painéis. Extraído do SVG inline original. */
const CloseButton: React.FC<CloseButtonProps> = React.memo(
  ({ onClick, ariaLabel = 'Fechar', size = 32 }) => {
    const iconSize = Math.round(size * 0.44)

    return (
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
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
