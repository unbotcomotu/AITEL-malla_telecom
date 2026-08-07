import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Algunos servicios (AuthContext) hacen fetch('/api/...') relativo en vez
      // de usar VITE_API_URL; este proxy los redirige igual hacia el gateway.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})