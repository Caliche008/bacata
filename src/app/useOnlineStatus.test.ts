import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * Pruebas del hook de estado de conexión. Se simulan los eventos `online` /
 * `offline` del `window` y se controla `navigator.onLine`.
 */

afterEach(() => {
  vi.restoreAllMocks();
});

function setOnLine(value: boolean): void {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value);
}

describe('useOnlineStatus', () => {
  it('inicia con el valor de navigator.onLine (online)', () => {
    setOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('inicia offline cuando navigator.onLine es false', () => {
    setOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('pasa a offline al disparar el evento offline y vuelve a online', () => {
    setOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
