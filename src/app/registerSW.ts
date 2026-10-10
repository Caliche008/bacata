/**
 * Registro del Service Worker de la PWA (tarea 12, R5.1/R5.2/R10.3).
 *
 * Usa el módulo virtual de vite-plugin-pwa (`virtual:pwa-register`) con
 * `immediate: true` y SIN prompt: la estrategia es `autoUpdate` (ver
 * vite.config.ts), así que la versión nueva se instala y activa de forma
 * transparente en la próxima carga. Es seguro porque el progreso del estudiante
 * vive en IndexedDB (R5.3), no en memoria, así que una recarga no pierde datos.
 *
 * El contenido pedagógico ya viaja en el precache del build (import.meta.glob en
 * src/content/loader.ts), de modo que las lecciones se completan sin conexión
 * una vez cargada la app por primera vez (R5.2/R5.5).
 *
 * Es defensivo: en entornos sin Service Worker (jsdom/pruebas, SSR) no hace nada
 * y no lanza. El import del módulo virtual es dinámico para que la suite de
 * pruebas no tenga que resolverlo.
 */
export async function registerServiceWorker(): Promise<void> {
  // No hay SW en entornos de prueba/SSR: evitar resolver el módulo virtual.
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: true });
  } catch {
    // Un fallo al registrar no debe romper el arranque de la app: la app sigue
    // funcionando (solo sin capacidades offline hasta el próximo intento).
  }
}
