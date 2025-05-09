import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://editor-server-4yde.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
