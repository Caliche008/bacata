import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerServiceWorker } from './registerSW';

/**
 * Pruebas del registro del Service Worker. En jsdom no hay `serviceWorker`, así
 * que la función debe ser un no-op que NO lanza ni intenta resolver el módulo
 * virtual de vite-plugin-pwa (que no existe en el entorno de prueba).
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('registerServiceWorker', () => {
  it('no lanza y no hace nada cuando no hay Service Worker (jsdom)', async () => {
    // jsdom no expone navigator.serviceWorker: se asegura el no-op.
    await expect(registerServiceWorker()).resolves.toBeUndefined();
  });

  it('no lanza cuando no hay window (SSR)', async () => {
    vi.stubGlobal('window', undefined);
    await expect(registerServiceWorker()).resolves.toBeUndefined();
  });
});
