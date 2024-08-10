import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist' // Ensure that this is set to 'dist'
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://x-backend-v5rr.onrender.com",
        changeOrigin: true
      }
    }
  }
})
