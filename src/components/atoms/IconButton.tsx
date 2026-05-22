import React, { type ReactNode } from 'react'

interface IconButtonProps {
  onClick: () => void
  children: ReactNode
  /** Label acessível */
  ariaLabel: string
  /** Tamanho em px (default: 36) */
  size?: number
  /** Classes adicionais Tailwind */
  className?: string
  /** Desabilitado? */
  disabled?: boolean
}

/** Botão genérico com ícone. Reutilizável para qualquer ação. */
const IconButton: React.FC<IconButtonProps> = React.memo(
  ({ onClick, children, ariaLabel, size = 36, className = '', disabled = false }) => {
    return (
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        {children}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
export default IconButton
