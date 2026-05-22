# 🧠 AIMindMap — Mapa Interativo de AI Engineering

> Um mergulho interativo pelos neurônios da IA moderna. Explore conceitos de LLMs, RAG, Agentes, Fine-tuning e mais em um grafo 3D flutuante.

[![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.184-000000?logo=three.js)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Features

- **🌐 Grafo 3D Interativo** — Nós flutuando sem gravidade com físicas suaves (anti-gravity)
- **🏷️ Labels 3D nos Nós** — Texto sempre legível via sprites que rotacionam com o nó
- **🎨 Paleta Neon por Grupo** — 7 grupos de cores vibrantes (base, emissive, accent)
- **📚 Conteúdo Educacional** — Clique em qualquer nó para explorar explicações, código, prós/contras
- **🎯 RAG como Centro** — RAG (Retrieval-Augmented Generation) posicionado como hub central
- **📱 Responsivo** — Funciona em desktop (mouse) e mobile (touch)
- **⚡ Performance Otimizada** — Geometrias e materiais Three.js cacheados, zero re-renders desnecessários
- **🏗️ Atomic Design** — Arquitetura em atoms → molecules → organisms → templates → pages

---

## 🚀 Tecnologias

| Tecnologia | Versão | Propósito |
|---|---|---|
| React | 19 | UI Framework |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Build tool |
| Three.js | 0.184 | Renderização 3D |
| react-force-graph-3d | 1.29 | Grafo de força 3D |
| @react-three/fiber | 9 | React + Three.js |
| @react-three/drei | 10 | Helpers R3F |
| framer-motion | 12 | Animações |
| Tailwind CSS | 4 | Estilos utilitários |
| d3-force-3d | 3 | Física do grafo |

---

## 🏗️ Arquitetura: Atomic Design

```
src/
├── components/
│   ├── atoms/           # ▸ Blocos fundamentais (Botão, Badge, Esfera, Sprite)
│   ├── molecules/       # ▸ Composições (Nó com Label, Link, Campo de Estrelas)
│   ├── organisms/       # ▸ Seções complexas (Grafo, Painel, Fundo)
│   ├── templates/       # ▸ Layouts (Z-stack principal)
│   └── pages/           # ▸ Páginas (MindMapPage — dono do estado)
├── hooks/               # ▸ Hooks custom (seleção, física, responsivo, disposal)
├── services/            # ▸ Serviços (registry de seções, layout do grafo)
├── utils/               # ▸ Utilitários (Three.js cache, pointer, responsivo)
├── constants/           # ▸ Paleta de cores (fonte única)
├── data/                # ▸ Dados estáticos (topologia + conteúdo educacional)
└── types/               # ▸ Tipos TypeScript
```

### Fluxo de Dados

```
MindMapPage (estado: selectedNodeId)
  └── MainLayout (layout puro)
        ├── ParticleBackground (fundo 3D)
        ├── GraphScene (grafo 3D com ForceGraph3D)
        ├── HeroOverlay (título, quando sem seleção)
        └── DetailPanel (painel, quando com seleção)
              └── NodeContentRenderer (dispatch via Registry)
                    ├── SectionTextBody
                    ├── SectionConceptList
                    ├── SectionCodeBlock
                    ├── SectionProsCons
                    └── SectionLinkList
```

---

## 🎯 Como Usar

1. **Explore o grafo 3D** — Arraste para rotacionar a cena
2. **Clique/tap em um nó** — A câmera zoom no nó e o painel de detalhes abre
3. **Leia o conteúdo** — Cada nó tem: visão geral, conceitos-chave, exemplos de código e mais
4. **Feche o painel** — Clique no X ou no mesmo nó novamente
5. **Mobile** — Tap para selecionar, drag para rotacionar, pinch para zoom

---

## 🧪 Adicionar Novo Conteúdo

### 1. Adicionar um nó no grafo

Edite `src/data/map.ts`:

```ts
{
  id: 'MeuConceito',
  group: 3,                // 1-7 (define a cor)
  description: 'Descrição curta.',
  content: nodeContent.MeuConceito
}
```

E adicione o link:
```ts
{ source: 'RAG', target: 'MeuConceito' }
```

### 2. Adicionar o conteúdo

Edite `src/data/content.ts`:

```ts
MeuConceito: {
  summary: 'Resumo...',
  sections: [
    { title: 'Visão Geral', type: 'overview', body: '...' },
    { title: 'Exemplo', type: 'code-example', code: { language: 'python', source: '...' } }
  ]
}
```

### 3. Tipos de seção disponíveis

| Tipo | Renderizador | Arquivo |
|---|---|---|
| `overview` | Parágrafo | `SectionTextBody.tsx` |
| `how-it-works` | Parágrafo | `SectionTextBody.tsx` |
| `architecture` | Parágrafo | `SectionTextBody.tsx` |
| `key-concepts` | Lista com bullets | `SectionConceptList.tsx` |
| `code-example` | Bloco de código + copiar | `SectionCodeBlock.tsx` |
| `pros-cons` | Card destacado | `SectionProsCons.tsx` |
| `related-links` | Lista de links | `SectionLinkList.tsx` |

Para adicionar um novo tipo: crie uma molécula e registre com `registerRenderer('novo-tipo', SeuComponente)`.

---

## ⚡ Performance

- Geometrias e materiais Three.js são **cacheados globalmente** (sem recriação por frame)
- Posições dos nós atualizadas via **ref mutável** (sem re-render React a 60fps)
- Todos os componentes usam **`React.memo`** com props rasas
- **Disposal automático** de objetos Three.js ao desmontar (sem vazamento GPU)
- Física **anti-gravidade** com `d3-force-3d` (nós flutuam sem colapsar)

---

## 📱 Mobile

- Touch-drag rotaciona a cena
- Touch-pinch para zoom
- DetailPanel vira **bottom-sheet** em telas < 768px
- Touch targets mínimos de 44×44px
- Hero text responsivo: `text-4xl` mobile, `text-6xl` desktop

---

## 🚦 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento com HMR |
| `npm run build` | Compila TypeScript + build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |

---

## 🧠 RAG é o Centro?

**Sim.** O RAG (Retrieval-Augmented Generation) é o paradigma mais impactante na engenharia de IA moderna. Ele resolve o problema principal dos LLMs (conhecimento desatualizado e alucinações) e conecta-se com MCP, Agentes, Quantização e Fine-tuning. Por isso, o nó RAG está fixo no centro `(0,0,0)` com destaque visual (maior, mais brilhante, pulsante).

---

## 📄 Licença

MIT
