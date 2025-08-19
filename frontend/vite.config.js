import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-golf': {
        target: 'https://api.golfcourseapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-golf/, '')
      }
    }
  }
})