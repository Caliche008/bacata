import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LOW_SPACE_THRESHOLD_BYTES,
  useStoragePersistence,
} from './useStoragePersistence';

/**
 * Pruebas del hook de persistencia/cuota (R5.6). Se simula `navigator.storage`
 * en los tres escenarios: concede con espacio, deniega con poco espacio, y API
 * ausente. Sigue el patrón de mock de `src/lib/storage/persistence.test.ts`.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubStorage(storage: Partial<StorageManager> | undefined): void {
  vi.stubGlobal('navigator', storage ? { onLine: true, storage } : { onLine: true });
}

describe('useStoragePersistence', () => {
  it('concede persistencia con espacio suficiente: sin aviso', async () => {
    const free = LOW_SPACE_THRESHOLD_BYTES * 4;
    stubStorage({
      persist: () => Promise.resolve(true),
      persisted: () => Promise.resolve(true),
      estimate: () => Promise.resolve({ usage: 0, quota: free }),
    });

    const { result } = renderHook(() => useStoragePersistence());

    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.persisted).toBe(true);
    expect(result.current.lowSpace).toBe(false);
    expect(result.current.apiUnavailable).toBe(false);
  });

  it('deniega persistencia o poco espacio: marca lowSpace', async () => {
    const free = Math.floor(LOW_SPACE_THRESHOLD_BYTES / 2);
    stubStorage({
      persist: () => Promise.resolve(false),
      persisted: () => Promise.resolve(false),
      estimate: () => Promise.resolve({ usage: 0, quota: free }),
    });

    const { result } = renderHook(() => useStoragePersistence());

    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.lowSpace).toBe(true);
    expect(result.current.apiUnavailable).toBe(false);
  });

  it('API ausente: apiUnavailable sin aviso ruidoso', async () => {
    stubStorage(undefined);

    const { result } = renderHook(() => useStoragePersistence());

    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.apiUnavailable).toBe(true);
    expect(result.current.lowSpace).toBe(false);
  });
});
