/**
 * Preferencias y estado local del PANEL DOCENTE sobre `localStorage` (misma
 * capa de preferencias; patrón `safeGet`/`safeSet`/`safeRemove`).
 *
 * Modo local (MVP): el docente es por DISPOSITIVO, no hay cuentas ni servidor.
 * Aquí se guarda:
 * - `teacherPinHash`: hash del PIN del docente (R8.6). NUNCA el PIN en claro.
 * - `teacherSession`: bandera de sesión docente activa (separada de la del
 *   estudiante). No guarda PII.
 * - `classGrade.<claseId>`: el grado (6/7) que el docente eligió gestionar para
 *   una clase, para recordar su elección (ver plan: `ClaseLocal` no lleva grado,
 *   así se evita bump de `DB_VERSION`).
 *
 * Privacidad (Ley 1581): no se guarda PII ni el PIN en claro.
 *
 * Fase 2: traerá cuentas docente reales (correo solo para recuperación — R6.9).
 */

import type { Grado } from '../../content/types';

/** Claves namespaced para no colisionar con otras apps del mismo origen. */
const PIN_HASH_KEY = 'bacata.teacher.pinHash';
const SESSION_KEY = 'bacata.teacher.session';
const CLASS_GRADE_PREFIX = 'bacata.teacher.classGrade.';

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
    // Sin almacenamiento: el estado vive en memoria durante el uso actual.
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ídem: sin almacenamiento, no hay nada que limpiar.
  }
}

/** Hash del PIN docente persistido, o null si aún no se ha configurado. */
export function getTeacherPinHash(): string | null {
  const value = safeGet(PIN_HASH_KEY);
  return value && value.length > 0 ? value : null;
}

/** Guarda el hash del PIN docente (nunca el PIN en claro — R8.6). */
export function setTeacherPinHash(hash: string): void {
  safeSet(PIN_HASH_KEY, hash);
}

/** Verdadero si hay una sesión docente activa en este dispositivo. */
export function isTeacherSessionActive(): boolean {
  return safeGet(SESSION_KEY) === '1';
}

/** Marca o limpia la sesión docente activa. */
export function setTeacherSession(active: boolean): void {
  if (active) {
    safeSet(SESSION_KEY, '1');
  } else {
    safeRemove(SESSION_KEY);
  }
}

/** Cierra la sesión docente (el hash del PIN permanece para reentrar). */
export function clearTeacherSession(): void {
  safeRemove(SESSION_KEY);
}

function isGrado(value: string | null): value is '6' | '7' {
  return value === '6' || value === '7';
}

/** Grado que el docente eligió gestionar para una clase, o null si no hay. */
export function getClassGrade(claseId: string): Grado | null {
  const value = safeGet(`${CLASS_GRADE_PREFIX}${claseId}`);
  return isGrado(value) ? (Number(value) as Grado) : null;
}

/** Recuerda el grado que el docente eligió gestionar para una clase. */
export function setClassGrade(claseId: string, grado: Grado): void {
  safeSet(`${CLASS_GRADE_PREFIX}${claseId}`, String(grado));
}

/** Olvida el grado recordado para una clase (p. ej. al eliminarla). */
export function clearClassGrade(claseId: string): void {
  safeRemove(`${CLASS_GRADE_PREFIX}${claseId}`);
}
