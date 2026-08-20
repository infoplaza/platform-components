import { defineConfig } from 'vite'

export default defineConfig({
  root: './demo',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    fs: {
      allow: ['..'],
    },
  },
})
