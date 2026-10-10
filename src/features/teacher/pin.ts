/**
 * Hashing del PIN del docente con Web Crypto (`crypto.subtle`), sin dependencia
 * criptográfica nueva (R8.6).
 *
 * El PIN del docente es la credencial local del panel (modo por dispositivo).
 * Decisiones de seguridad:
 * - Nunca se guarda el PIN en claro; solo su derivación PBKDF2 (SHA-256) con un
 *   salt aleatorio por dispositivo.
 * - El valor serializado es `salt:hash` (ambos en base64) para poder re-derivar
 *   con el mismo salt al verificar.
 * - La verificación re-deriva con el salt guardado y compara en tiempo
 *   constante, para no filtrar información por el tiempo de respuesta.
 * - Esta capa NUNCA registra el PIN ni el hash en logs.
 *
 * Lógica pura (sin React): fácil de probar con Vitest.
 */

/** Iteraciones de PBKDF2. Fijas; suficiente para una credencial local. */
const PBKDF2_ITERATIONS = 100_000;
/** Longitud de la clave derivada en bits (SHA-256). */
const DERIVED_KEY_BITS = 256;
/** Longitud del salt en bytes. */
const SALT_BYTES = 16;

/** Longitud mínima/máxima del PIN (solo dígitos, legible y memorizable). */
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 8;

const PIN_PATTERN = new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`);

/** Verdadero si el PIN tiene un formato aceptable (4–8 dígitos). */
export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

function toBase64(bytes: Uint8Array): string {
  let binario = '';
  for (const b of bytes) {
    binario += String.fromCharCode(b);
  }
  return btoa(binario);
}

function fromBase64(valor: string): Uint8Array {
  const binario = atob(valor);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

async function derivar(pin: string, salt: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto.subtle;
  const material = await subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    material,
    DERIVED_KEY_BITS,
  );
  return new Uint8Array(bits);
}

/**
 * Deriva el hash del PIN con un salt aleatorio y devuelve `salt:hash` en base64.
 * El PIN en claro no sale de esta función.
 */
export async function hashPin(pin: string): Promise<string> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derivar(pin, salt);
  return `${toBase64(salt)}:${toBase64(hash)}`;
}

/** Comparación en tiempo constante de dos arreglos de bytes. */
function compararConstante(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diferencia = 0;
  for (let i = 0; i < a.length; i += 1) {
    diferencia |= a[i] ^ b[i];
  }
  return diferencia === 0;
}

/**
 * Verifica un PIN contra el valor almacenado (`salt:hash`). Re-deriva con el
 * mismo salt y compara en tiempo constante. Un valor almacenado malformado
 * devuelve `false` en vez de lanzar.
 */
export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const partes = stored.split(':');
  if (partes.length !== 2) {
    return false;
  }
  try {
    const salt = fromBase64(partes[0]);
    const esperado = fromBase64(partes[1]);
    const derivado = await derivar(pin, salt);
    return compararConstante(derivado, esperado);
  } catch {
    return false;
  }
}
