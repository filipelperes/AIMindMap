/**
 * Theme system.
 * Use useTheme() hook to access the current theme mode.
 * All visual theming is handled via Tailwind dark: variant (data-theme attribute).
 */

import type { GroupPalette } from '../types/mindmap'

export type ThemeMode = 'dark' | 'light'

/** Dark palettes (saturated for dark background) */
const darkGroupColors: Record<number, GroupPalette> = {
  1:  { base: '#FF006E', emissive: '#FF4081', accent: '#FF80AB', label: 'Foundations' },
  2:  { base: '#00E676', emissive: '#69F0AE', accent: '#B9F6CA', label: 'Prompt Engineering' },
  3:  { base: '#00B0FF', emissive: '#40C4FF', accent: '#80D8FF', label: 'RAG & Search' },
  4:  { base: '#FFAB00', emissive: '#FFD740', accent: '#FFE57F', label: 'Fine-Tuning' },
  5:  { base: '#D500F9', emissive: '#E040FB', accent: '#EA80FC', label: 'Agents & MCP' },
  6:  { base: '#FF1744', emissive: '#FF5252', accent: '#FF8A80', label: 'System Design' },
  7:  { base: '#00E5FF', emissive: '#4DD0E1', accent: '#80DEEA', label: 'LLMOps & Production' },
  8:  { base: '#76FF03', emissive: '#AED581', accent: '#C5E1A5', label: 'Vector DBs' },
  9:  { base: '#FF9100', emissive: '#FFB74D', accent: '#FFCC80', label: 'Evaluation & Testing' },
  10: { base: '#EA80FC', emissive: '#CE93D8', accent: '#E1BEE7', label: 'Safety & Ethics' },
  11: { base: '#18FFFF', emissive: '#4DD0E1', accent: '#80DEEA', label: 'Multimodal' },
  12: { base: '#FFD740', emissive: '#FFE082', accent: '#FFECB3', label: 'Infrastructure' },
  13: { base: '#FF6E40', emissive: '#FF8A65', accent: '#FFAB91', label: 'Practice & Coding' },
  14: { base: '#B388FF', emissive: '#B388FF', accent: '#D1C4E9', label: 'Behavioral & Scenarios' },
  15: { base: '#FF6B6B', emissive: '#FF8E8E', accent: '#FFB3B3', label: 'Protocols & Standards' },
}

/** Light palettes (softened for light background) — 3 distinct colors per group */
const lightGroupColors: Record<number, GroupPalette> = {
  1:  { base: '#D0005A', emissive: '#E8307A', accent: '#F0A0C0', label: 'Foundations' },
  2:  { base: '#00A857', emissive: '#30D878', accent: '#A0E8B0', label: 'Prompt Engineering' },
  3:  { base: '#0088CC', emissive: '#30A8E0', accent: '#A0D0F0', label: 'RAG & Search' },
  4:  { base: '#CC8900', emissive: '#E8A830', accent: '#F0D8A0', label: 'Fine-Tuning' },
  5:  { base: '#AA00C7', emissive: '#CC30E0', accent: '#E0A0F0', label: 'Agents & MCP' },
  6:  { base: '#CC0030', emissive: '#E03058', accent: '#F0A0B0', label: 'System Design' },
  7:  { base: '#00B3CC', emissive: '#30C8E0', accent: '#A0E0F0', label: 'LLMOps & Production' },
  8:  { base: '#54CC00', emissive: '#78E030', accent: '#C0F0A0', label: 'Vector DBs' },
  9:  { base: '#CC7400', emissive: '#E89830', accent: '#F0D0A0', label: 'Evaluation & Testing' },
  10: { base: '#C050E0', emissive: '#D470E8', accent: '#E8B0F0', label: 'Safety & Ethics' },
  11: { base: '#00CCCC', emissive: '#30E0E0', accent: '#A0F0F0', label: 'Multimodal' },
  12: { base: '#CCAD00', emissive: '#E8C830', accent: '#F0E8A0', label: 'Infrastructure' },
  13: { base: '#CC4A20', emissive: '#E87048', accent: '#F0B8A0', label: 'Practice & Coding' },
  14: { base: '#8855DD', emissive: '#A878E8', accent: '#D0B8F0', label: 'Behavioral & Scenarios' },
  15: { base: '#CC4444', emissive: '#E86868', accent: '#F0B0B0', label: 'Protocols & Standards' },
}

/**
 * Returns a complete GroupPalette adapted for the current theme.
 * In light mode, colors are softened for better contrast,
 * each with its own color nuance.
 */
export function getGroupPaletteForTheme(group: number, mode: ThemeMode): GroupPalette {
  if (mode === 'dark') {
    return darkGroupColors[group] || darkGroupColors[1]
  }
  return lightGroupColors[group] || lightGroupColors[1]
}
