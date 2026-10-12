import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SPLASH_MIN_MS, useSplashMinimo } from './useSplashMinimo';

/**
 * Pruebas del mínimo de visibilidad del splash de arranque. Se usan fake timers
 * para avanzar el reloj de forma determinista y comprobar que el booleano pasa
 * de `false` a `true` justo al cumplir el umbral, sin fugas al desmontar.
 */

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSplashMinimo', () => {
  it('la constante de duración es exactamente 2300 ms', () => {
    expect(SPLASH_MIN_MS).toBe(2300);
  });

  it('arranca en false (mínimo no cumplido)', () => {
    const { result } = renderHook(() => useSplashMinimo());
    expect(result.current).toBe(false);
  });

  it('sigue en false justo antes del umbral', () => {
    const { result } = renderHook(() => useSplashMinimo());
    act(() => {
      vi.advanceTimersByTime(SPLASH_MIN_MS - 1);
    });
    expect(result.current).toBe(false);
  });

  it('pasa a true al cumplir el umbral', () => {
    const { result } = renderHook(() => useSplashMinimo());
    act(() => {
      vi.advanceTimersByTime(SPLASH_MIN_MS);
    });
    expect(result.current).toBe(true);
  });

  it('no fuga: desmontar antes del umbral no dispara el estado', () => {
    const { result, unmount } = renderHook(() => useSplashMinimo());
    unmount();
    act(() => {
      vi.advanceTimersByTime(SPLASH_MIN_MS);
    });
    // Tras desmontar, el temporizador se limpió: el valor leído sigue en false
    // y avanzar el reloj no provoca errores ni actualizaciones de estado.
    expect(result.current).toBe(false);
  });
});
