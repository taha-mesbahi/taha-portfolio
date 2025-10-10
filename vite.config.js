import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/taha-portfolio/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets_v2', // 🔥 nouveau dossier d’assets pour forcer le refresh
    emptyOutDir: true,
  },
})
