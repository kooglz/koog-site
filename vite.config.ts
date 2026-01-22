import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果是生产环境构建，且部署到 GitHub Pages，则使用仓库名作为 base
  base: process.env.GITHUB_PAGES === 'true' ? '/koog-site/' : './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'public/admin/index.html'),
      },
    },
  },
})
