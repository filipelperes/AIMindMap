import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/AIMindMap/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('three')) return 'three'
          if (id.includes('react-force-graph-3d') || id.includes('d3-force-3d')) return 'force-graph'
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'AI MindMap - Mapa Interativo de AI Engineering',
        short_name: 'AI MindMap',
        description:
          'Explore AI Engineering em 3D: LLMs, RAG, Agentes, Fine-Tuning, System Design e muito mais.',
        theme_color: '#080B1A',
        background_color: '#080B1A',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧠</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        categories: ['education', 'technology', 'ai'],
        lang: 'pt-BR',
        start_url: '/AIMindMap/',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
