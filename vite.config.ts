import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'logo.webp',
          'logo-transparent.webp',
          'og-image.png',
          'og-image-square.png',
          'icons/apple-touch-icon.png',
          'icons/favicon-32x32.png',
          'icons/favicon-16x16.png',
          'icons/pwa-192x192.png',
          'icons/pwa-512x512.png',
          'icons/pwa-maskable-192x192.png',
          'icons/pwa-maskable-512x512.png'
        ],
        manifest: false, // Usamos public/manifest.webmanifest curado a mano
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,webp,svg,woff2}'],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              // Cache Supabase API responses (products, slides, etc.) con NetworkFirst rápido
              urlPattern: /^https:\/\/tkfpmmjnyzmulxkmtesf\.supabase\.co\/rest\/v1\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                networkTimeoutSeconds: 4,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 horas
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache Supabase Storage images (fotos de productos, banners)
              urlPattern: /^https:\/\/tkfpmmjnyzmulxkmtesf\.supabase\.co\/storage\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'supabase-storage-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache CDN PayPhone Box v2.0
              urlPattern: /^https:\/\/cdn\.payphonetodoesposible\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'payphone-cdn-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache Google Fonts hojas de estilo
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache Google Fonts fuentes descargables (.woff2)
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /\/googlea04c1dce4977fc72\.html$/],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: true, // Permite conexiones desde la red local (celulares)
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/payphone': {
          target: 'https://pay.payphonetodoesposible.com/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/payphone/, ''),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('scheduler') || id.includes('motion')) {
                return 'vendor-core';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
            }
          },
        },
      },
    },
  };
});
