import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/AIMindMap/',
  server: {
    open: false,
  },
  build: {
    rolldownOptions: {
      output: {
        // Rolldown uses codeSplitting.groups instead of manualChunks
        // https://rolldown.rs/in-depth/manual-code-splitting
        codeSplitting: {
          groups: [
            {
              name: 'three',
              test: /[\\/]node_modules[\\/]three[\\/]/,
            },
            {
              name: 'force-graph',
              test: /react-force-graph-3d|d3-force-3d/,
            },
            {
              name: 'motion',
              test: /framer-motion/,
            },
            {
              name: 'i18n',
              test: /react-i18next|i18next/,
            },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2022',
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
        name: 'AI MindMap - Interactive AI Engineering Mind Map',
        short_name: 'AI MindMap',
        description:
          'Explore AI Engineering in 3D: LLMs, RAG, Agents, Fine-Tuning, System Design and more.',
        theme_color: '#080B1A',
        background_color: '#080B1A',
        display: 'standalone',
        orientation: 'any',
        scope: '/AIMindMap/',
        id: '/AIMindMap/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        categories: ['education', 'technology', 'ai'],
        lang: 'en-US',
        start_url: '/AIMindMap/',
      },
      workbox: {
        // Only precache lightweight assets — heavy vendor chunks (three.js, force-graph)
        // use runtime caching so first load isn't blocked by ~2MB downloads
        globPatterns: ['**/*.{css,html,svg,png,woff2}', '**/assets/index-*.js'],
        // SPA fallback: serve index.html for any navigation request when offline
        navigateFallback: '/AIMindMap/',
        navigateFallbackAllowlist: [/^\/AIMindMap\//],
        // Automatically clean up precaches from older versions
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(?:three|graph-vendor|force-graph).*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'graph-vendor-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|webp|ico|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
