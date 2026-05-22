import type { GroupPalette } from '../types/mindmap'

/**
 * Paleta de cores para os grupos de conhecimento.
 * Usada tanto no dark mode quanto no light mode.
 * 
 * NOTA: Essas são as cores SATURADAS dos grupos.
 * Para integração com tema, use o ThemeContext.
 */

export const GROUP_PALETTE: Record<number, GroupPalette> = {
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

export function getGroupColor(group: number): GroupPalette {
  return GROUP_PALETTE[group] ?? GROUP_PALETTE[1]
}

/**
 * Tema escuro (padrão) — cores fixas para o fundo 3D.
 */
export const THEME = {
  background: '#080B1A',
  bgGradient: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.15), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(0,255,240,0.08), transparent 50%), #080B1A',
  textPrimary: '#F0F4FF',
  textSecondary: '#8899BB',
  accent: '#00FFF0',
  glow: 'rgba(0,255,240,0.3)',
  panelBg: 'rgba(8,11,26,0.88)',
  panelBorder: 'rgba(255,255,255,0.08)',
  nodeBaseRadius: 5,
  ragRadius: 7.5,
} as const
