# Plano: Acessibilidade de Cores das Moléculas (UI/UX)

## Problemas Identificados

### 1. Contraste Insuficiente em Light Mode (CRÍTICO)

Muitos grupos têm contraste abaixo de WCAG AA (3:1 para componentes UI) no light mode (#F0F4FF):

| Grupo | Cor Atual (Light) | Contraste vs BG | Status |
|-------|-------------------|-----------------|--------|
| 8 (Vector DBs) | `#54CC00` | ~1.86:1 | ❌ FAIL |
| 10 (Segurança) | `#C050E0` | ~3.25:1 | ⚠️ UI only |
| 11 (Multimodal) | `#00CCCC` | ~1.79:1 | ❌ FAIL |
| 12 (Infraestrutura) | `#CCAD00` | ~1.92:1 | ❌ FAIL |
| 14 (Behavioral) | `#8855DD` | ~3.8:1 | ⚠️ UI only |
| 1 (Fundamentos) | `#D0005A` | ~3.5:1 | ⚠️ UI only |
| 4 (Fine-Tuning) | `#CC8900` | ~2.3:1 | ❌ FAIL |
| 9 (Avaliação) | `#CC7400` | ~2.5:1 | ❌ FAIL |
| 7 (LLMOps) | `#00B3CC` | ~2.8:1 | ❌ FAIL |

### 2. Grupos Visualmente Similares em Dark Mode

| Pares | Contraste entre cores | Problema |
|-------|---------------------|----------|
| G7 (`#00E5FF`) vs G11 (`#18FFFF`) | Muito baixo | Ambos ciano/esverdeados |
| G7 (`#00E5FF`) vs Accent (`#00FFF0`) | Muito baixo | Confunde com acento do tema |
| G11 (`#18FFFF`) vs Accent (`#00FFF0`) | Muito baixo | Idem |
| G3 (`#00B0FF`) vs G7 (`#00E5FF`) | Baixo | Azul vs ciano — difícil distinguir |
| G10 (`#EA80FC`) vs G14 (`#B388FF`) | Médio | Dois tons de roxo/lavanda |

### 3. Duplicação de Cores

- `src/constants/colors.ts` (GROUP_PALETTE) e `src/constants/theme.ts` (darkGroupColors) contêm **os mesmos valores**
- `colors.ts` não é theme-aware — `getGroupColor()` sempre retorna cores dark
- Componentes como DetailPanel e SidebarNav usam `getGroupColor()` (dark-only) mesmo em light mode

### 4. Legibilidade do Texto nas Esferas 3D

- Light mode: texto `#1A1A2E` sobre esfera colorida pode ser ilegível quando a cor base tem luminância similar
- Dark mode: texto branco geralmente OK, mas alguns grupos com emissive muito forte podem "lavar" o texto

### 5. CSS Variables Faltando para Light Mode Group Colors

- `index.css` define `--color-group-1` a `--color-group-14` apenas para dark mode
- Sem equivalents em `[data-theme="light"]`

---

## Plano de Ação

### Fase 1: Novo Sistema de Cores WCAG AA

#### Light Mode — Novas Cores (contraste ≥ 4.5:1 com #F0F4FF)

| Grupo | Nova Cor | Contraste Alvo |
|-------|----------|----------------|
| 1 Fundamentos | `#B8004A` | ≥ 4.5:1 |
| 2 Eng. Prompt | `#00853E` | ≥ 4.5:1 |
| 3 RAG & Busca | `#006699` | ≥ 4.5:1 |
| 4 Fine-Tuning | `#996600` | ≥ 4.5:1 |
| 5 Agentes & MCP | `#7A0091` | ≥ 4.5:1 |
| 6 System Design | `#990020` | ≥ 4.5:1 |
| 7 LLMOps | `#008099` | ≥ 4.5:1 |
| 8 Vector DBs | `#3D9900` | ≥ 4.5:1 |
| 9 Avaliação | `#995500` | ≥ 4.5:1 |
| 10 Segurança | `#8A2BE2` | ≥ 4.5:1 |
| 11 Multimodal | `#008888` | ≥ 4.5:1 |
| 12 Infraestrutura | `#998200` | ≥ 4.5:1 |
| 13 Prática | `#993300` | ≥ 4.5:1 |
| 14 Behavioral | `#6633AA` | ≥ 4.5:1 |
| 15 Protocolos | `#992E2E` | ≥ 4.5:1 |

#### Dark Mode — Cores Ajustadas (maior diferenciação entre grupos)

| Grupo | Nova Cor | Notas |
|-------|----------|-------|
| 1 Fundamentos | `#FF006E` | Mantida (icônica) |
| 2 Eng. Prompt | `#00E676` | Mantida |
| 3 RAG & Busca | `#4488FF` | Alterada de `#00B0FF` (azul mais puro, difere de G7/G11) |
| 4 Fine-Tuning | `#FFAB00` | Mantida |
| 5 Agentes & MCP | `#D500F9` | Mantida |
| 6 System Design | `#FF1744` | Mantida |
| 7 LLMOps | `#00E5FF` | Mantida (único ciano) |
| 8 Vector DBs | `#76FF03` | Mantida |
| 9 Avaliação | `#FF9100` | Mantida |
| 10 Segurança | `#EA80FC` | Mantida |
| 11 Multimodal | **`#FF6B9D`** | Alterada para rosa quente (difere de G7 ciano) |
| 12 Infraestrutura | `#FFD740` | Mantida |
| 13 Prática | `#FF6E40` | Mantida |
| 14 Behavioral | **`#7C4DFF`** | Alterada para violeta mais distinto (difere de G10) |
| 15 Protocolos | `#FF6B6B` | Mantida |

### Fase 2: Refatoração das Constantes de Cor

**Ações:**
1. **Remover** `src/constants/colors.ts` — consolidar tudo em `src/constants/theme.ts`
2. **Atualizar** `themePalette.groups` com os novos valores dark/light
3. **Atualizar** `darkGroupColors` e `lightGroupColors` com emissive/accent consistentes
4. **Remover** `getGroupColor()` — migrar todos os consumers para `getGroupPaletteForTheme()` ou `getGroupThemeColor()`

### Fase 3: Melhorias no Gráfico 3D (GraphScene.tsx)

**Ações:**
1. **Esfera**: Em light mode, usar cor base mais escura + borda clara para contraste do texto
2. **Emissive intensity**: Reduzir em light mode (já existe `mode === 'light' ? 0.6 : 2`) — ajustar valores
3. **Texto na esfera**: Em light mode, garantir que `#1A1A2E` tenha contraste ≥ 4.5:1 — adicionar fundo semi-transparente atrás do texto
4. **Sprite label**: Usar cor de texto contrastante com fundo — adicionar outline/sombra no label
5. **Links**: Aumentar opacidade padrão em light mode (`rgba(0,0,0,0.12)` → `rgba(0,0,0,0.25)`)
6. **Glow rings/efeitos**: Usar cores do tema que funcionem em ambos os modos

### Fase 4: Atualizar Componentes UI

**DetailPanel.tsx:**
- Trocar `getGroupColor()` por `getGroupPaletteForTheme(node.group, mode)`
- Usar `textOnAccent` do theme (existe mas nunca usado) para texto sobre cores de grupo

**SidebarNav.tsx:**
- Trocar `getGroupColor()` por `getGroupPaletteForTheme(node.group, mode)`
- Ajustar cores de hover/active states para funcionar em light mode

### Fase 5: CSS Variables

**`index.css`:**
- Adicionar `--color-group-1-light` a `--color-group-15-light` em `[data-theme="light"]`
- Ou alternativamente, remover as variáveis CSS de grupo e usar apenas o sistema JS

### Fase 6: Verificação Final

- Rodar `npm run typecheck` e `npm run lint`
- Verificar visualmente dark e light mode
- Garantir que todas as 15 moléculas são distinguíveis em ambos os modos
- Verificar contraste de texto nas esferas 3D

---

## Arquivos a Modificar

| Arquivo | Tipo | Ação |
|---------|------|------|
| `src/constants/theme.ts` | Constantes | Atualizar paletas dark/light com novos valores |
| `src/constants/colors.ts` | Constantes | Remover (opcional, ou manter como legado) |
| `src/index.css` | CSS | Adicionar light mode group colors |
| `src/components/organisms/GraphScene.tsx` | Componente | Ajustar cores, contraste, emissive, texto |
| `src/components/organisms/DetailPanel.tsx` | Componente | Usar theme-aware colors |
| `src/components/organisms/SidebarNav.tsx` | Componente | Usar theme-aware colors |
| `src/components/atoms/Badge.tsx` | Componente | Verificar contraste |
| `src/components/atoms/ColorDot.tsx` | Componente | Verificar contraste |
| `src/data/map.ts` | Dados | Nenhuma mudança necessária |
| `src/types/mindmap.ts` | Types | Nenhuma mudança necessária |

---

## Critérios de Sucesso (Acceptance Criteria)

1. ✅ Todas as 15 cores de grupo em **light mode** têm contraste ≥ 3:1 com o fundo (WCAG AA para componentes gráficos)
2. ✅ Idealmente ≥ 4.5:1 para texto (onde aplicável)
3. ✅ Todas as 15 cores de grupo em **dark mode** têm contraste ≥ 3:1 com o fundo
4. ✅ Cada grupo é visualmente distinguível dos vizinhos (contraste ≥ 2:1 entre pares similares)
5. ✅ Texto nas esferas 3D é legível em ambos os modos
6. ✅ Código de cores não duplicado — fonte única da verdade em `theme.ts`
7. ✅ Nenhum componente usa `getGroupColor()` (dark-only) em vez de versão theme-aware
