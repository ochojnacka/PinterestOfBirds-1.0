import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Backend API - adjust port to match your backend PORT env variable
        // Note: If backend PORT=3000, change this to a different port (e.g., 5000)
        // to avoid conflict with frontend dev server
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
