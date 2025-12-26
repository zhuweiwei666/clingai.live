import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Dev: keep frontend calling same-origin `/api`
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  }
})

