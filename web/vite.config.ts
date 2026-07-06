import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, '../data/judotechnieken.json'),
    },
  },
  server: {
    port: 5174,
    strictPort: false,
    fs: {
      allow: ['..'],
    },
  },
})
