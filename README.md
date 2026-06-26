# 🧠 AIMindMap — Interactive AI Engineering Mind Map

> An interactive dive into the neurons of modern AI. Explore concepts like LLMs, RAG, Agents, Fine-tuning, and more in a floating 3D graph.

[![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.184-000000?logo=three.js)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Features

- **🌐 Interactive 3D Graph** — Nodes floating weightlessly with smooth physics (anti-gravity)
- **🏷️ 3D Labels on Nodes** — Always-readable text via sprites that rotate with the node
- **🎨 Neon Palette per Group** — 7 vibrant color groups (base, emissive, accent)
- **📚 Educational Content** — Click any node to explore explanations, code, pros/cons
- **🎯 RAG as Center** — RAG (Retrieval-Augmented Generation) positioned as the central hub
- **📱 Responsive** — Works on desktop (mouse) and mobile (touch)
- **⚡ Optimized Performance** — Cached Three.js geometries and materials, zero unnecessary re-renders
- **🏗️ Atomic Design** — Architecture in atoms → molecules → organisms → templates → pages

---

## 🚀 Technologies

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| TypeScript | 6 | Static typing |
| Vite | 8 | Build tool |
| Three.js | 0.184 | 3D Rendering |
| react-force-graph-3d | 1.29 | 3D Force Graph |
| @react-three/fiber | 9 | React + Three.js |
| @react-three/drei | 10 | Helpers R3F |
| framer-motion | 12 | Animations |
| Tailwind CSS | 4 | Utility styles |
| d3-force-3d | 3 | Graph physics |

---

## 🏗️ Architecture: Atomic Design

```
src/
├── components/
│   ├── atoms/           # ▸ Fundamental blocks (Button, Badge, Sphere, Sprite)
│   ├── molecules/       # ▸ Compositions (Node with Label, Link, Starfield)
│   ├── organisms/       # ▸ Complex sections (Graph, Panel, Background)
│   ├── templates/       # ▸ Layouts (Main Z-stack)
│   └── pages/           # ▸ Pages (MindMapPage — state owner)
├── data/                # ▸ Graph topology + educational content
│   ├── content.ts       #   English content (source of truth)
│   ├── content.pt-BR.ts #   Portuguese content (incremental translations)
│   ├── contentLocales.ts #  Locale-aware content resolver
│   └── map.ts           #   Graph nodes, links, learning path
├── hooks/               # ▸ Custom hooks (selection, physics, responsive, disposal, localization)
├── i18n/                # ▸ Internationalization (i18next config, locale switcher)
├── services/            # ▸ Services (section registry, graph layout)
├── store/               # ▸ State management (ThemeContext)
├── types/               # ▸ TypeScript types
├── utils/               # ▸ Utilities (Three.js cache, pointer, responsive)
└── constants/           # ▸ Color palette (single source)
```

### Data Flow

```
MindMapPage (state: selectedNodeId)
  └── MainLayout (pure layout)
        ├── ParticleBackground (3D background)
        ├── GraphScene (3D graph with ForceGraph3D)
        ├── HeroOverlay (title, when nothing selected)
        └── DetailPanel (panel, when something selected)
              └── NodeContentRenderer (dispatch via Registry)
                    ├── SectionTextBody
                    ├── SectionConceptList
                    ├── SectionCodeBlock
                    ├── SectionProsCons
                    └── SectionLinkList
```

---

## 🎯 How to Use

1. **Explore the 3D graph** — Drag to rotate the scene
2. **Click/tap a node** — The camera zooms to the node and the detail panel opens
3. **Read the content** — Each node has: overview, key concepts, code examples, and more
4. **Switch language** — Use the globe icon in the sidebar to toggle between English (US) and Portuguese (BR)
5. **Close the panel** — Click the X or the same node again
6. **Mobile** — Tap the hamburger menu, tap to select, drag to rotate, pinch to zoom

---

## 🌐 Internationalization (i18n)

This project uses **i18next** + **react-i18next** for UI translations and a locale-aware content loading system for educational content.

### Supported Languages

| Language | Code | UI Status | Content Status |
|---|---|---|---|
| English (US) | `en-US` | ✅ Complete | ✅ Complete |
| Portuguese (Brazil) | `pt-BR` | ✅ Complete | 🚧 In Progress |

### UI Translations

Translation files are in `src/i18n/locales/`. Each locale has a `translation.json` file.

**Extraction tool:** Keys can be auto-extracted from source code:

```bash
npm run i18n:extract     # Extract keys using i18next-parser
npm run i18n:status      # Check translation coverage across locales
npm run i18n:sort        # Sort translation JSON files alphabetically
npm run i18n:types       # Generate TypeScript definitions for translation keys
```

### Educational Content

The node content (summaries, sections, code examples) supports locale-aware loading via `src/data/contentLocales.ts`. Content resolution is handled at render time through the `useLocalizedNodeContent` hook, which falls back to English for any untranslated content.

**Adding a new language:**
1. Create `src/data/content.{lang}.ts` with translated node content
2. Register it in `src/data/contentLocales.ts`
3. Add the language to `SUPPORTED_LANGUAGES` in `src/i18n/i18n.ts`
4. Create `src/i18n/locales/{lang}/translation.json` with UI strings

---

## 🧪 Add New Content

### 1. Add a node to the graph

Edit `src/data/map.ts`:

```ts
{
  id: 'MyConcept',
  group: 3,                // 1-7 (defines the color)
  description: 'Short description.',
  content: nodeContent.MyConcept
}
```

And add the link:
```ts
{ source: 'RAG', target: 'MyConcept' }
```

### 2. Add the content

Edit `src/data/content.ts`:

```ts
MyConcept: {
  summary: 'Summary...',
  sections: [
    { title: 'Overview', type: 'overview', body: '...' },
    { title: 'Example', type: 'code-example', code: { language: 'python', source: '...' } }
  ]
}
```

### 3. Available section types

| Type | Renderer | File |
|---|---|---|
| `overview` | Paragraph | `SectionTextBody.tsx` |
| `how-it-works` | Paragraph | `SectionTextBody.tsx` |
| `architecture` | Paragraph | `SectionTextBody.tsx` |
| `key-concepts` | Bullet list | `SectionConceptList.tsx` |
| `code-example` | Code block + copy | `SectionCodeBlock.tsx` |
| `pros-cons` | Highlighted card | `SectionProsCons.tsx` |
| `related-links` | Link list | `SectionLinkList.tsx` |

To add a new type: create a molecule and register it with `registerRenderer('new-type', YourComponent)`.

---

## ⚡ Performance

- Three.js geometries and materials are **globally cached** (no recreation per frame)
- Node positions updated via **mutable ref** (no React re-render at 60fps)
- All components use **`React.memo`** with shallow props
- **Automatic disposal** of Three.js objects on unmount (no GPU leaks)
- **Anti-gravity** physics with `d3-force-3d` (nodes float without collapsing)

---

## 📱 Mobile

- Touch-drag rotates the scene
- Touch-pinch to zoom
- DetailPanel becomes a **bottom-sheet** on screens < 768px
- Minimum touch targets of 44×44px
- Responsive hero text: `text-4xl` mobile, `text-6xl` desktop

---

## 🚦 Scripts

| Command | Description |
|---|---|---|
| `npm run dev` | Starts development server with HMR |
| `npm run build` | Compiles TypeScript + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Runs ESLint |
| `npm run i18n:extract` | Extracts translation keys from source files (i18next-parser) |
| `npm run i18n:status` | Shows translation coverage across locales (i18next-cli) |
| `npm run i18n:sort` | Sorts translation JSON files alphabetically |
| `npm run i18n:types` | Generates TypeScript declarations for translation keys |

---

## 🧠 RAG is the Center?

**Yes.** RAG (Retrieval-Augmented Generation) is the most impactful paradigm in modern AI engineering. It solves the main problem of LLMs (outdated knowledge and hallucinations) and connects with MCP, Agents, Quantization, and Fine-tuning. That's why the RAG node is fixed at the center `(0,0,0)` with visual prominence (larger, brighter, pulsating).

---

## 📄 License

MIT
