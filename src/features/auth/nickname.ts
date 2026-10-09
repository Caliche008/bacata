/**
 * Validación y normalización del apodo del estudiante (lógica pura, sin React).
 *
 * Privacidad (R1.2): el apodo es el ÚNICO dato de identificación visible del
 * estudiante; no se pide nombre real, correo, teléfono, ubicación ni foto. El
 * aviso de "no uses tu nombre real" (R1.7) vive en la UI; aquí solo se valida
 * longitud y se normaliza para comparar unicidad por clase (R1.6).
 */

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;

/** Recorta espacios al borde y colapsa espacios internos repetidos. */
export function normalizeNickname(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

/**
 * Clave de comparación para unicidad: minúsculas, sin tildes y sin espacios.
 * Así "José" y "jose" cuentan como el mismo apodo dentro de una clase (R1.6).
 */
export function nicknameComparisonKey(raw: string): string {
  return normalizeNickname(raw)
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

/** Verdadero si el apodo normalizado tiene una longitud aceptable. */
export function isValidNicknameLength(raw: string): boolean {
  const length = normalizeNickname(raw).length;
  return length >= NICKNAME_MIN_LENGTH && length <= NICKNAME_MAX_LENGTH;
}

/** Verdadero si dos apodos son equivalentes para la unicidad por clase. */
export function nicknamesMatch(a: string, b: string): boolean {
  return nicknameComparisonKey(a) === nicknameComparisonKey(b);
}
