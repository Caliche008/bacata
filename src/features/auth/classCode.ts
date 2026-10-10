/**
 * Validación y normalización del código de clase (lógica pura, sin React).
 *
 * Decisión de producto (Opción B, MVP solo local): NO hay backend que valide
 * la existencia del código. Cualquier código con FORMATO válido crea una sesión
 * local. Aquí solo se decide si el formato es aceptable (R1.3) y se normaliza
 * para que la unicidad de apodo y la recuperación de sesión sean consistentes
 * (R1.6, R1.4).
 *
 * Formato (R1.8, "difícil de adivinar" + legible en gama baja): 6 a 8
 * caracteres de un alfabeto SIN caracteres ambiguos (sin 0/O, 1/I/L). Da del
 * orden de 24^6 combinaciones mínimas y evita confusiones de lectura.
 */

/** Alfabeto sin caracteres ambiguos (sin 0, O, 1, I, L). */
export const CLASS_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const CLASS_CODE_MIN_LENGTH = 6;
export const CLASS_CODE_MAX_LENGTH = 8;

/**
 * Regex de validación sobre el valor YA normalizado. Se construye desde el
 * alfabeto para que ambos no puedan divergir.
 */
const CLASS_CODE_PATTERN = new RegExp(
  `^[${CLASS_CODE_ALPHABET}]{${CLASS_CODE_MIN_LENGTH},${CLASS_CODE_MAX_LENGTH}}$`,
);

/**
 * Normaliza la entrada del estudiante: recorta espacios y pasa a mayúsculas.
 * La entrada es insensible a mayúsculas; el valor normalizado es el que se
 * guarda en `codigoClase` y se compara.
 */
export function normalizeClassCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Verdadero si el valor normalizado cumple el formato (R1.3). */
export function isValidClassCode(raw: string): boolean {
  return CLASS_CODE_PATTERN.test(normalizeClassCode(raw));
}

/** Longitud por defecto del código generado (dentro del rango válido). */
export const CLASS_CODE_DEFAULT_LENGTH = 7;

/**
 * Genera un código de clase aleatorio (R6.1) con caracteres del alfabeto sin
 * ambigüedades. Usa `crypto.getRandomValues` para una selección uniforme (con
 * rechazo de módulo sesgado); si no hay Web Crypto, cae a `Math.random` como
 * último recurso (mismo patrón defensivo que `ids.ts`). El resultado siempre
 * cumple `isValidClassCode`.
 */
export function generateClassCode(length: number = CLASS_CODE_DEFAULT_LENGTH): string {
  const longitud = Math.min(
    CLASS_CODE_MAX_LENGTH,
    Math.max(CLASS_CODE_MIN_LENGTH, Math.trunc(length)),
  );
  const alfabeto = CLASS_CODE_ALPHABET;
  const n = alfabeto.length;
  const cryptoObj = globalThis.crypto;

  let resultado = '';
  if (cryptoObj?.getRandomValues) {
    // Rechazo de valores en la cola no divisible por `n` para evitar sesgo.
    const limite = Math.floor(256 / n) * n;
    const buffer = new Uint8Array(1);
    while (resultado.length < longitud) {
      cryptoObj.getRandomValues(buffer);
      const valor = buffer[0];
      if (valor < limite) {
        resultado += alfabeto[valor % n];
      }
    }
    return resultado;
  }

  for (let i = 0; i < longitud; i += 1) {
    resultado += alfabeto[Math.floor(Math.random() * n)];
  }
  return resultado;
}
