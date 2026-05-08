import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'MakedoTest',
        short_name: 'MakedoTest',
        description: 'Platforma za kreiranje i polaganje testovi so offline poddrshka.',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'mk',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB (react-pdf adds ~700 KB)
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
            },
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.split('\\').join('/');

          if (normalizedId.includes('/node_modules/')) {
            if (
              normalizedId.includes('/react/') ||
              normalizedId.includes('/react-dom/') ||
              normalizedId.includes('/scheduler/') ||
              normalizedId.includes('/use-sync-external-store/')
            ) {
              return 'vendor-react';
            }
            if (normalizedId.includes('/firebase/')) {
              return 'vendor-firebase';
            }
            if (normalizedId.includes('/docx/')) {
              return 'vendor-docx';
            }
            if (normalizedId.includes('/@react-pdf/renderer/')) {
              return 'vendor-pdf-renderer';
            }
            if (
              normalizedId.includes('/@react-pdf/') ||
              normalizedId.includes('/pdfkit/') ||
              normalizedId.includes('/fontkit/') ||
              normalizedId.includes('/restructure/') ||
              normalizedId.includes('/unicode-properties/')
            ) {
              return 'vendor-pdf-core';
            }
            if (normalizedId.includes('/yjs/')) {
              return 'vendor-collab';
            }
            if (normalizedId.includes('/tesseract.js/')) {
              return 'vendor-vision';
            }
            if (normalizedId.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            if (normalizedId.includes('/zod/')) {
              return 'vendor-zod';
            }
            if (normalizedId.includes('/zustand/')) {
              return 'vendor-state';
            }
            if (normalizedId.includes('/nanoid/')) {
              return 'vendor-utils';
            }
          }

          if (normalizedId.includes('/src/features/take/')) return 'feature-take';
          if (normalizedId.includes('/src/features/analytics/')) return 'feature-analytics';
          if (normalizedId.includes('/src/features/collab/')) return 'feature-collab';
          if (normalizedId.includes('/src/features/export/')) return 'feature-export';
          if (normalizedId.includes('/src/features/editor/')) return 'feature-editor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    exclude: ['**/node_modules/**', '**/dist/**', 'functions/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'backup_v6_*/**',
        '**/*.config.*',
        'src/test/**',
        'src/main.jsx',
      ],
    },
  },
});
