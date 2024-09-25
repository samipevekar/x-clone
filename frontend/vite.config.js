import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',  // Automatically updates the service worker
      includeAssets: ['favicon.ico','apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'], // Assets to include
      manifest: {
        name: 'Twitter Clone',
        short_name: 'TwitterClone',
        description: 'A Twitter clone built with MERN stack',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ],
  build: {
    outDir: 'dist' // Ensure that this is set to 'dist'
  },
  server: {
    port: 3000,
  }
})