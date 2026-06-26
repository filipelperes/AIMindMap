# Plan: Molecule Color Accessibility (UI/UX)

## Identified Problems

### 1. Insufficient Contrast in Light Mode (CRITICAL)

Many groups have contrast below WCAG AA (3:1 for UI components) in light mode (#F0F4FF):

| Group | Current Color (Light) | Contrast vs BG | Status |
|-------|----------------------|----------------|--------|
| 8 (Vector DBs) | `#54CC00` | ~1.86:1 | ❌ FAIL |
| 10 (Security) | `#C050E0` | ~3.25:1 | ⚠️ UI only |
| 11 (Multimodal) | `#00CCCC` | ~1.79:1 | ❌ FAIL |
| 12 (Infrastructure) | `#CCAD00` | ~1.92:1 | ❌ FAIL |
| 14 (Behavioral) | `#8855DD` | ~3.8:1 | ⚠️ UI only |
| 1 (Fundamentos) | `#D0005A` | ~3.5:1 | ⚠️ UI only |
| 4 (Fine-Tuning) | `#CC8900` | ~2.3:1 | ❌ FAIL |
| 9 (Evaluation) | `#CC7400` | ~2.5:1 | ❌ FAIL |
| 7 (LLMOps) | `#00B3CC` | ~2.8:1 | ❌ FAIL |

### 2. Visually Similar Groups in Dark Mode

| Pairs | Contrast Between Colors | Issue |
|-------|------------------------|-------|
| G7 (`#00E5FF`) vs G11 (`#18FFFF`) | Very low | Both cyan/greenish |
| G7 (`#00E5FF`) vs Accent (`#00FFF0`) | Very low | Confuses with theme accent |
| G11 (`#18FFFF`) vs Accent (`#00FFF0`) | Very low | Idem |
| G3 (`#00B0FF`) vs G7 (`#00E5FF`) | Low | Blue vs cyan — hard to distinguish |
| G10 (`#EA80FC`) vs G14 (`#B388FF`) | Medium | Two shades of purple/lavender |

### 3. Color Duplication

- `src/constants/colors.ts` (GROUP_PALETTE) and `src/constants/theme.ts` (darkGroupColors) contain **the same values**
- `colors.ts` is not theme-aware — `getGroupColor()` always returns dark colors
- Components like DetailPanel and SidebarNav use `getGroupColor()` (dark-only) even in light mode

### 4. Text Readability on 3D Spheres

- Light mode: text `#1A1A2E` over colored sphere can be illegible when the base color has similar luminance
- Dark mode: white text generally OK, but some groups with very strong emissive can "wash out" the text

### 5. Missing CSS Variables for Light Mode Group Colors

- `index.css` defines `--color-group-1` to `--color-group-14` for dark mode only
- No equivalents in `[data-theme="light"]`

---

## Action Plan

### Phase 1: New WCAG AA Color System

#### Light Mode — New Colors (contrast ≥ 4.5:1 with #F0F4FF)

| Group | New Color | Target Contrast |
|-------|-----------|----------------|
| 1 Fundamentals | `#B8004A` | ≥ 4.5:1 |
| 2 Prompt Eng. | `#00853E` | ≥ 4.5:1 |
| 3 RAG & Search | `#006699` | ≥ 4.5:1 |
| 4 Fine-Tuning | `#996600` | ≥ 4.5:1 |
| 5 Agents & MCP | `#7A0091` | ≥ 4.5:1 |
| 6 System Design | `#990020` | ≥ 4.5:1 |
| 7 LLMOps | `#008099` | ≥ 4.5:1 |
| 8 Vector DBs | `#3D9900` | ≥ 4.5:1 |
| 9 Evaluation | `#995500` | ≥ 4.5:1 |
| 10 Security | `#8A2BE2` | ≥ 4.5:1 |
| 11 Multimodal | `#008888` | ≥ 4.5:1 |
| 12 Infrastructure | `#998200` | ≥ 4.5:1 |
| 13 Practice | `#993300` | ≥ 4.5:1 |
| 14 Behavioral | `#6633AA` | ≥ 4.5:1 |
| 15 Protocols | `#992E2E` | ≥ 4.5:1 |

#### Dark Mode — Adjusted Colors (greater differentiation between groups)

| Group | New Color | Notes |
|-------|-----------|-------|
| 1 Fundamentals | `#FF006E` | Kept (iconic) |
| 2 Prompt Eng. | `#00E676` | Kept |
| 3 RAG & Search | `#4488FF` | Changed from `#00B0FF` (purer blue, differs from G7/G11) |
| 4 Fine-Tuning | `#FFAB00` | Kept |
| 5 Agents & MCP | `#D500F9` | Kept |
| 6 System Design | `#FF1744` | Kept |
| 7 LLMOps | `#00E5FF` | Kept (unique cyan) |
| 8 Vector DBs | `#76FF03` | Kept |
| 9 Evaluation | `#FF9100` | Kept |
| 10 Security | `#EA80FC` | Kept |
| 11 Multimodal | **`#FF6B9D`** | Changed to hot pink (differs from G7 cyan) |
| 12 Infrastructure | `#FFD740` | Kept |
| 13 Practice | `#FF6E40` | Kept |
| 14 Behavioral | **`#7C4DFF`** | Changed to more distinct violet (differs from G10) |
| 15 Protocols | `#FF6B6B` | Kept |

### Phase 2: Color Constants Refactoring

**Actions:**
1. **Remove** `src/constants/colors.ts` — consolidate everything in `src/constants/theme.ts`
2. **Update** `themePalette.groups` with the new dark/light values
3. **Update** `darkGroupColors` and `lightGroupColors` with consistent emissive/accent
4. **Remove** `getGroupColor()` — migrate all consumers to `getGroupPaletteForTheme()` or `getGroupThemeColor()`

### Phase 3: 3D Graph Improvements (GraphScene.tsx)

**Actions:**
1. **Sphere**: In light mode, use darker base color + light border for text contrast
2. **Emissive intensity**: Reduce in light mode (already has `mode === 'light' ? 0.6 : 2`) — adjust values
3. **Text on sphere**: In light mode, ensure `#1A1A2E` has contrast ≥ 4.5:1 — add semi-transparent background behind text
4. **Sprite label**: Use contrasting text color with background — add outline/shadow on label
5. **Links**: Increase default opacity in light mode (`rgba(0,0,0,0.12)` → `rgba(0,0,0,0.25)`)
6. **Glow rings/effects**: Use theme colors that work in both modes

### Phase 4: Update UI Components

**DetailPanel.tsx:**
- Replace `getGroupColor()` with `getGroupPaletteForTheme(node.group, mode)`
- Use `textOnAccent` from theme (exists but never used) for text over group colors

**SidebarNav.tsx:**
- Replace `getGroupColor()` with `getGroupPaletteForTheme(node.group, mode)`
- Adjust hover/active state colors to work in light mode

### Phase 5: CSS Variables

**`index.css`:**
- Add `--color-group-1-light` through `--color-group-15-light` in `[data-theme="light"]`
- Or alternatively, remove group CSS variables and use only the JS system

### Phase 6: Final Verification

- Run `npm run typecheck` and `npm run lint`
- Visually verify dark and light mode
- Ensure all 15 molecules are distinguishable in both modes
- Verify text contrast on 3D spheres

---

## Files to Modify

| File | Type | Action |
|------|------|--------|
| `src/constants/theme.ts` | Constants | Update dark/light palettes with new values |
| `src/constants/colors.ts` | Constants | Remove (optional, or keep as legacy) |
| `src/index.css` | CSS | Add light mode group colors |
| `src/components/organisms/GraphScene.tsx` | Component | Adjust colors, contrast, emissive, text |
| `src/components/organisms/DetailPanel.tsx` | Component | Use theme-aware colors |
| `src/components/organisms/SidebarNav.tsx` | Component | Use theme-aware colors |
| `src/components/atoms/Badge.tsx` | Component | Verify contrast |
| `src/components/atoms/ColorDot.tsx` | Component | Verify contrast |
| `src/data/map.ts` | Data | No changes needed |
| `src/types/mindmap.ts` | Types | No changes needed |

---

## Acceptance Criteria

1. ✅ All 15 group colors in **light mode** have contrast ≥ 3:1 against the background (WCAG AA for graphical components)
2. ✅ Ideally ≥ 4.5:1 for text (where applicable)
3. ✅ All 15 group colors in **dark mode** have contrast ≥ 3:1 against the background
4. ✅ Each group is visually distinguishable from neighbors (contrast ≥ 2:1 between similar pairs)
5. ✅ Text on 3D spheres is readable in both modes
6. ✅ No duplicated color code — single source of truth in `theme.ts`
7. ✅ No component uses `getGroupColor()` (dark-only) instead of a theme-aware version
