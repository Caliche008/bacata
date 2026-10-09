/**
 * Persistencia de la SESIÓN ACTIVA del estudiante y del estado de intentos, en
 * `localStorage` (misma capa de preferencias; patrón `safeGet`/`safeSet`).
 *
 * Por qué localStorage y no un store nuevo en IndexedDB:
 * - El id de sesión debe leerse de forma SÍNCRONA en el arranque para decidir
 *   el gate sin parpadeo (IndexedDB es asíncrono).
 * - El perfil completo (sin PII) ya vive en IndexedDB; aquí solo se guarda el
 *   `id` del perfil activo. No se añade un store nuevo (evita bump de
 *   `DB_VERSION` por un único id).
 *
 * Privacidad (Ley 1581): el id de sesión es un identificador interno, NO PII.
 * No se guarda aquí el apodo ni el código. El estado de intentos tampoco es PII.
 */

import type { AttemptsState } from '../../features/auth/attempts';

/** Claves namespaced para no colisionar con otras apps del mismo origen. */
const SESSION_KEY = 'bacata.session';
const ATTEMPTS_KEY = 'bacata.auth.attempts';

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento disponible: la sesión vive en memoria durante el uso
    // actual; simplemente no persiste al recargar. No es un error fatal.
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ídem: sin almacenamiento, no hay nada que limpiar.
  }
}

/** Id del perfil activo persistido, o null si no hay sesión. */
export function getActiveSessionId(): string | null {
  const value = safeGet(SESSION_KEY);
  return value && value.length > 0 ? value : null;
}

/** Marca el perfil `id` como la sesión activa (R1.4). */
export function setActiveSessionId(id: string): void {
  safeSet(SESSION_KEY, id);
}

/** Cierra la sesión activa (el perfil permanece en IndexedDB para reentrar). */
export function clearActiveSessionId(): void {
  safeRemove(SESSION_KEY);
}

/**
 * Lee el estado de intentos persistido. Devuelve null si no hay o si el valor
 * está corrupto (se trata como "sin intentos").
 */
export function getAttemptsState(): AttemptsState | null {
  const raw = safeGet(ATTEMPTS_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'fallos' in parsed &&
      'bloqueadoHasta' in parsed
    ) {
      const { fallos, bloqueadoHasta } = parsed as Record<string, unknown>;
      if (
        typeof fallos === 'number' &&
        (bloqueadoHasta === null || typeof bloqueadoHasta === 'number')
      ) {
        return { fallos, bloqueadoHasta };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Persiste el estado de intentos para que el bloqueo sobreviva a un recargar. */
export function setAttemptsState(state: AttemptsState): void {
  safeSet(ATTEMPTS_KEY, JSON.stringify(state));
}

/** Limpia el estado de intentos persistido. */
export function clearAttemptsState(): void {
  safeRemove(ATTEMPTS_KEY);
}
