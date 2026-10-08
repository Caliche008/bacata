import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getStorageEstimate,
  isStoragePersisted,
  requestPersistentStorage,
} from './persistence';

/**
 * Pruebas de los helpers de persistencia/cuota. Se cubren tres escenarios de
 * `navigator.storage`: concede, niega y ausente. Lo clave: ninguno lanza y el
 * valor devuelto es coherente con la disponibilidad de la API.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Reemplaza `navigator` por un stub con el `storage` indicado (o sin él). */
function stubNavigator(storage: Partial<StorageManager> | undefined): void {
  vi.stubGlobal('navigator', storage ? { storage } : {});
}

describe('requestPersistentStorage', () => {
  it('devuelve true cuando la API concede', async () => {
    stubNavigator({ persist: () => Promise.resolve(true) });
    expect(await requestPersistentStorage()).toBe(true);
  });

  it('devuelve false cuando la API niega', async () => {
    stubNavigator({ persist: () => Promise.resolve(false) });
    expect(await requestPersistentStorage()).toBe(false);
  });

  it('devuelve false sin lanzar cuando la API no existe', async () => {
    stubNavigator(undefined);
    await expect(requestPersistentStorage()).resolves.toBe(false);
  });
});

describe('isStoragePersisted', () => {
  it('refleja el resultado de persisted()', async () => {
    stubNavigator({ persisted: () => Promise.resolve(true) });
    expect(await isStoragePersisted()).toBe(true);
  });

  it('devuelve false sin lanzar cuando la API no existe', async () => {
    stubNavigator(undefined);
    await expect(isStoragePersisted()).resolves.toBe(false);
  });
});

describe('getStorageEstimate', () => {
  it('normaliza usage/quota cuando la API existe', async () => {
    stubNavigator({ estimate: () => Promise.resolve({ usage: 100, quota: 1000 }) });
    expect(await getStorageEstimate()).toEqual({ usage: 100, quota: 1000 });
  });

  it('normaliza a 0 los campos undefined', async () => {
    stubNavigator({ estimate: () => Promise.resolve({}) });
    expect(await getStorageEstimate()).toEqual({ usage: 0, quota: 0 });
  });

  it('devuelve null sin lanzar cuando la API no existe', async () => {
    stubNavigator(undefined);
    await expect(getStorageEstimate()).resolves.toBeNull();
  });
});
