import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/taha-portfolio/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets_debug',
    emptyOutDir: true,
    minify: false,          // ❌ Pas de minification -> code lisible
    sourcemap: true,        // 🧭 Ajoute une carte des sources pour déboguer
  },
})
