import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Importiere das Vue-Plugin
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(), // Vue-Plugin hinzufügen
    VitePWA({
      registerType: 'autoUpdate',  // Service Worker wird automatisch aktualisiert
      devOptions: {
        enabled: true,  // Ermöglicht den Service Worker im Entwicklungsmodus
      },
      manifest: {
        name: 'on23-colourpicker',
        short_name: 'on23-colourpicker',
        description: 'on23-colourpicker',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
