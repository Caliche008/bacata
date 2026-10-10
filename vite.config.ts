import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
//
// PWA offline-first (tarea 12). Decisiones:
// - `generateSW` (NO `injectManifest`): el contenido pedagógico ya viaja
//   empaquetado en el bundle (import.meta.glob en src/content/loader.ts), así
//   que entra en el precache del build. No hay fetch de red, cola de sync ni
//   caché custom que obligue a escribir un SW a mano. Workbox genera el SW con
//   cero código que mantener; es lo más robusto para gama baja y fácil de
//   verificar. `injectManifest` solo se justificaría con runtime caching
//   complejo o push (fuera de alcance).
// - `registerType: 'autoUpdate'`: el estudiante de secundaria no debe lidiar con
//   diálogos de actualización. autoUpdate + skipWaiting/clientsClaim instala la
//   versión nueva de forma transparente en la próxima carga. Seguro porque el
//   progreso vive en IndexedDB (R5.3), no en memoria.
// - Solo precache (cache-first implícito), sin runtimeCaching: todo lo necesario
//   (HTML/JS/CSS/iconos/contenido empaquetado) está en el output del build. No
//   hay recursos remotos en el MVP; añadir runtime caching sería peso sin
//   beneficio. `navigateFallback` → index.html para que cualquier ruta SPA abra
//   offline.
// Base pública del sitio. En GitHub Pages la app vive en un subdirectorio
// (https://<usuario>.github.io/bacata/), así que la base debe ser '/bacata/'.
// El workflow de despliegue define BASE_PATH='/bacata/'; en desarrollo/preview
// local y en los tests, la base por defecto es '/'. Mantener la barra final.
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Bacatá',
        short_name: 'Bacatá',
        description: 'Conoce tu historia, construye tu país.',
        lang: 'es',
        dir: 'ltr',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1F7A5A', // verde esmeralda (brand.md)
        background_color: '#FBF6EC', // crema (brand.md)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache del app shell + assets del build (incluye el contenido
        // empaquetado dentro de los chunks JS). cache-first implícito.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: `${BASE_PATH}index.html`,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Holgura para el chunk principal del contenido empaquetado (gama baja:
        // el precache es local, el límite solo evita cachear accidentes enormes).
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      // El SW no debe entrometerse en `vite preview`/dev salvo build real.
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
