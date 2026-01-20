import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/koog-site/', // 明确指定 GitHub Pages 的仓库名作为 base
})
