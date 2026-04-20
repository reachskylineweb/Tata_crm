import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // Allows LAN access (needed for VPS tunneling, Docker, etc.)
    port: 5173,      // Frontend dev port (3000 is reserved for backend)
    strictPort: true,
    proxy: {
      // In development, proxy /api requests to the local backend
      // Override VITE_DEV_PROXY_TARGET if your backend runs on a different port
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    // Generate source maps only in development
    sourcemap: false
  }
})