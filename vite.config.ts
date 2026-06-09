import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA pra "instalar" no tablet/TV da mesa e mostrar offline.
export default defineConfig({
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
