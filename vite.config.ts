import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// PREVIEW=1 builds a relative-path copy without the service worker, for hosting a preview anywhere
const IS_PREVIEW = process.env.PREVIEW === '1'
const BASE = IS_PREVIEW ? './' : '/gym-page/'
const THEME_COLOR = '#0B0B0C'
const MAX_PRECACHE_BYTES = 3 * 1024 * 1024

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      disable: IS_PREVIEW,
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Gym Log',
        short_name: 'Gym',
        display: 'standalone',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,json,woff2}'],
        maximumFileSizeToCacheInBytes: MAX_PRECACHE_BYTES
      }
    })
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
})
