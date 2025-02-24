import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.js',
    registerType: 'prompt',
    injectRegister: false,

    manifest: {
      name: 'on23-colourpicker',
      short_name: 'on23-colourpicker',
      description: 'on23-colourpicker',
      theme_color: '#ffffff',

      icons: [{
        src: 'pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png',
      }, {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      }, {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }, {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }],
    },

    injectManifest: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})