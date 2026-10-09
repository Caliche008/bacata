import { describe, expect, it } from 'vitest';
import {
  INITIAL_ATTEMPTS,
  LOCK_MS,
  MAX_ATTEMPTS,
  clearExpiredLock,
  isLocked,
  registerFailedAttempt,
  remainingMs,
  resetAttempts,
  type AttemptsState,
} from './attempts';

const NOW = 1_000_000;

describe('registerFailedAttempt', () => {
  it('acumula fallos sin bloquear antes del máximo', () => {
    let state: AttemptsState = INITIAL_ATTEMPTS;
    for (let i = 0; i < MAX_ATTEMPTS - 1; i += 1) {
      state = registerFailedAttempt(state, NOW);
    }
    expect(state.fallos).toBe(MAX_ATTEMPTS - 1);
    expect(isLocked(state, NOW)).toBe(false);
  });

  it('bloquea al alcanzar el máximo de intentos', () => {
    let state: AttemptsState = INITIAL_ATTEMPTS;
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      state = registerFailedAttempt(state, NOW);
    }
    expect(isLocked(state, NOW)).toBe(true);
    expect(state.bloqueadoHasta).toBe(NOW + LOCK_MS);
  });
});

describe('remainingMs / isLocked', () => {
  it('calcula el tiempo restante del bloqueo', () => {
    const state: AttemptsState = { fallos: 0, bloqueadoHasta: NOW + LOCK_MS };
    expect(remainingMs(state, NOW)).toBe(LOCK_MS);
    expect(remainingMs(state, NOW + LOCK_MS)).toBe(0);
  });

  it('no está bloqueado una vez vencido el plazo', () => {
    const state: AttemptsState = { fallos: 0, bloqueadoHasta: NOW };
    expect(isLocked(state, NOW + 1)).toBe(false);
  });
});

describe('resetAttempts / clearExpiredLock', () => {
  it('un éxito reinicia el contador', () => {
    expect(resetAttempts()).toEqual(INITIAL_ATTEMPTS);
  });

  it('limpia un bloqueo ya expirado', () => {
    const state: AttemptsState = { fallos: 0, bloqueadoHasta: NOW };
    expect(clearExpiredLock(state, NOW + 1)).toEqual({
      fallos: 0,
      bloqueadoHasta: null,
    });
  });

  it('conserva un bloqueo vigente', () => {
    const state: AttemptsState = { fallos: 0, bloqueadoHasta: NOW + LOCK_MS };
    expect(clearExpiredLock(state, NOW)).toBe(state);
  });
});
