import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@btn-height-default': '40px',
          '@primary-color': '#e74c3c',
          '@success-color': '#27ae60',
          '@warning-color': '#f39c12',
          '@error-color': '#e74c3c'
        },
        javascriptEnabled: true
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})