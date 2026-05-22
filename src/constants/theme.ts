/**
 * Sistema de temas Dark/Light.
 * Use useTheme() hook para acessar o tema atual.
 */

export type ThemeMode = 'dark' | 'light'

export interface ThemeColors {
  background: string
  bgGradient: string
  textPrimary: string
  textSecondary: string
  accent: string
  glow: string
  panelBg: string
  panelBorder: string
  surface: string
  surfaceAlt: string
  border: string
  selectionBg: string
  textOnAccent: string
}

export const darkTheme: ThemeColors = {
  background: '#080B1A',
  bgGradient: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.15), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(0,255,240,0.08), transparent 50%), #080B1A',
  textPrimary: '#F0F4FF',
  textSecondary: '#8899BB',
  accent: '#00FFF0',
  glow: 'rgba(0,255,240,0.3)',
  panelBg: 'rgba(8,11,26,0.88)',
  panelBorder: 'rgba(255,255,255,0.08)',
  surface: 'rgba(255,255,255,0.04)',
  surfaceAlt: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.06)',
  selectionBg: 'rgba(0,255,240,0.2)',
  textOnAccent: '#080B1A',
}

export const lightTheme: ThemeColors = {
  background: '#F0F4FF',
  bgGradient: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.06), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(0,200,255,0.05), transparent 50%), #F0F4FF',
  textPrimary: '#1A1A2E',
  textSecondary: '#555577',
  accent: '#7C3AED',
  glow: 'rgba(124,58,237,0.2)',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.08)',
  surface: 'rgba(0,0,0,0.03)',
  surfaceAlt: 'rgba(0,0,0,0.06)',
  border: 'rgba(0,0,0,0.06)',
  selectionBg: 'rgba(124,58,237,0.15)',
  textOnAccent: '#FFFFFF',
}

export const themePalette = {
  groups: {
    1:  { dark: '#FF006E', light: '#D0005A' },
    2:  { dark: '#00E676', light: '#00A857' },
    3:  { dark: '#00B0FF', light: '#0088CC' },
    4:  { dark: '#FFAB00', light: '#CC8900' },
    5:  { dark: '#D500F9', light: '#AA00C7' },
    6:  { dark: '#FF1744', light: '#CC0030' },
    7:  { dark: '#00E5FF', light: '#00B3CC' },
    8:  { dark: '#76FF03', light: '#54CC00' },
    9:  { dark: '#FF9100', light: '#CC7400' },
    10: { dark: '#EA80FC', light: '#C050E0' },
    11: { dark: '#18FFFF', light: '#00CCCC' },
    12: { dark: '#FFD740', light: '#CCAD00' },
    13: { dark: '#FF6E40', light: '#CC4A20' },
    14: { dark: '#B388FF', light: '#8855DD' },
  } as Record<number, { dark: string; light: string }>,
}

/**
 * Obtém cor do grupo baseada no tema.
 */
export function getGroupThemeColor(group: number, mode: ThemeMode): string {
  const colors = themePalette.groups[group]
  if (!colors) return mode === 'dark' ? '#FF006E' : '#D0005A'
  return colors[mode]
}
