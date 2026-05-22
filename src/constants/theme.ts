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

export interface ThemeGroupPalette {
  base: string
  emissive: string
  accent: string
  label: string
}

/** Paletas dark (saturadas para fundo escuro) */
const darkGroupColors: Record<number, ThemeGroupPalette> = {
  1:  { base: '#FF006E', emissive: '#FF4081', accent: '#FF80AB', label: 'Fundamentos' },
  2:  { base: '#00E676', emissive: '#69F0AE', accent: '#B9F6CA', label: 'Engenharia de Prompt' },
  3:  { base: '#00B0FF', emissive: '#40C4FF', accent: '#80D8FF', label: 'RAG & Busca' },
  4:  { base: '#FFAB00', emissive: '#FFD740', accent: '#FFE57F', label: 'Fine-Tuning' },
  5:  { base: '#D500F9', emissive: '#E040FB', accent: '#EA80FC', label: 'Agentes & MCP' },
  6:  { base: '#FF1744', emissive: '#FF5252', accent: '#FF8A80', label: 'System Design' },
  7:  { base: '#00E5FF', emissive: '#4DD0E1', accent: '#80DEEA', label: 'LLMOps & Produção' },
  8:  { base: '#76FF03', emissive: '#AED581', accent: '#C5E1A5', label: 'Vector DBs' },
  9:  { base: '#FF9100', emissive: '#FFB74D', accent: '#FFCC80', label: 'Avaliação & Testes' },
  10: { base: '#EA80FC', emissive: '#CE93D8', accent: '#E1BEE7', label: 'Segurança & Ética' },
  11: { base: '#18FFFF', emissive: '#4DD0E1', accent: '#80DEEA', label: 'Multimodal' },
  12: { base: '#FFD740', emissive: '#FFE082', accent: '#FFECB3', label: 'Infraestrutura' },
  13: { base: '#FF6E40', emissive: '#FF8A65', accent: '#FFAB91', label: 'Prática & Coding' },
  14: { base: '#B388FF', emissive: '#B388FF', accent: '#D1C4E9', label: 'Behavioral & Cenários' },
  15: { base: '#FF6B6B', emissive: '#FF8E8E', accent: '#FFB3B3', label: 'Protocolos & Padrões' },
}

/** Paletas light (suavizadas para fundo claro) — 3 cores distintas por grupo */
const lightGroupColors: Record<number, ThemeGroupPalette> = {
  1:  { base: '#D0005A', emissive: '#E8307A', accent: '#F0A0C0', label: 'Fundamentos' },
  2:  { base: '#00A857', emissive: '#30D878', accent: '#A0E8B0', label: 'Engenharia de Prompt' },
  3:  { base: '#0088CC', emissive: '#30A8E0', accent: '#A0D0F0', label: 'RAG & Busca' },
  4:  { base: '#CC8900', emissive: '#E8A830', accent: '#F0D8A0', label: 'Fine-Tuning' },
  5:  { base: '#AA00C7', emissive: '#CC30E0', accent: '#E0A0F0', label: 'Agentes & MCP' },
  6:  { base: '#CC0030', emissive: '#E03058', accent: '#F0A0B0', label: 'System Design' },
  7:  { base: '#00B3CC', emissive: '#30C8E0', accent: '#A0E0F0', label: 'LLMOps & Produção' },
  8:  { base: '#54CC00', emissive: '#78E030', accent: '#C0F0A0', label: 'Vector DBs' },
  9:  { base: '#CC7400', emissive: '#E89830', accent: '#F0D0A0', label: 'Avaliação & Testes' },
  10: { base: '#C050E0', emissive: '#D470E8', accent: '#E8B0F0', label: 'Segurança & Ética' },
  11: { base: '#00CCCC', emissive: '#30E0E0', accent: '#A0F0F0', label: 'Multimodal' },
  12: { base: '#CCAD00', emissive: '#E8C830', accent: '#F0E8A0', label: 'Infraestrutura' },
  13: { base: '#CC4A20', emissive: '#E87048', accent: '#F0B8A0', label: 'Prática & Coding' },
  14: { base: '#8855DD', emissive: '#A878E8', accent: '#D0B8F0', label: 'Behavioral & Cenários' },
  15: { base: '#CC4444', emissive: '#E86868', accent: '#F0B0B0', label: 'Protocolos & Padrões' },
}

/**
 * Retorna um GroupPalette completo adaptado para o tema atual.
 * No light mode, as cores são suavizadas para melhor contraste,
 * cada uma com sua própria nuance de cor.
 */
export function getGroupPaletteForTheme(group: number, mode: ThemeMode): ThemeGroupPalette {
  if (mode === 'dark') {
    return darkGroupColors[group] || darkGroupColors[1]
  }
  return lightGroupColors[group] || lightGroupColors[1]
}
