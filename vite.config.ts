import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// `base` configurável: GitHub Pages serve em /guild-briefings/ (via BASE_PATH
// no workflow); Netlify e dev servem na raiz. O seed de party.json usa
// import.meta.env.BASE_URL, então respeita os dois.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Guild Briefings',
        short_name: 'Guild',
        description: 'Dossiê da party de aventureiros',
        theme_color: '#1a120b',
        background_color: '#1a120b',
        display: 'standalone',
      },
    }),
  ],
})
