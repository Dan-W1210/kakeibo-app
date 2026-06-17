import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 開発時は /api へのリクエストをバックエンド(3001)へプロキシする
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
