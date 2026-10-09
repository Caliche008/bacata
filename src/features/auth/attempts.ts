/**
 * Límite de intentos con bloqueo temporal local (R1.8). Lógica pura y testeable,
 * sin React ni acceso directo a `localStorage` (la persistencia la hace el
 * hook/UI con las utilidades de `src/lib/preferences`).
 *
 * Modelo Opción B: en el MVP el "fallo" es un código con FORMATO inválido (no
 * hay servidor que rechace credenciales). Tras `MAX_ATTEMPTS` fallos
 * consecutivos se bloquea el ingreso durante `LOCK_MS`, con una señal clara y
 * amable (sin castigo severo, coherente con la gamificación sana). Un intento
 * con formato válido reinicia el contador.
 */

/** Intentos fallidos consecutivos permitidos antes del bloqueo. */
export const MAX_ATTEMPTS = 5;

/** Duración del bloqueo temporal en milisegundos (30 s). */
export const LOCK_MS = 30_000;

/**
 * Estado persistible de los intentos. `bloqueadoHasta` es un epoch en ms
 * (o null si no hay bloqueo activo).
 */
export interface AttemptsState {
  fallos: number;
  bloqueadoHasta: number | null;
}

/** Estado inicial sin fallos ni bloqueo. */
export const INITIAL_ATTEMPTS: AttemptsState = {
  fallos: 0,
  bloqueadoHasta: null,
};

/** Verdadero si el estado está bloqueado en el instante `now`. */
export function isLocked(state: AttemptsState, now: number): boolean {
  return state.bloqueadoHasta !== null && state.bloqueadoHasta > now;
}

/** Milisegundos restantes de bloqueo en el instante `now` (0 si no hay). */
export function remainingMs(state: AttemptsState, now: number): number {
  if (state.bloqueadoHasta === null) {
    return 0;
  }
  return Math.max(0, state.bloqueadoHasta - now);
}

/**
 * Registra un intento fallido. Si alcanza `MAX_ATTEMPTS`, activa el bloqueo
 * `LOCK_MS` desde `now` y reinicia el contador de fallos (el siguiente ciclo
 * vuelve a contar desde cero tras el bloqueo).
 */
export function registerFailedAttempt(
  state: AttemptsState,
  now: number,
): AttemptsState {
  const fallos = state.fallos + 1;
  if (fallos >= MAX_ATTEMPTS) {
    return { fallos: 0, bloqueadoHasta: now + LOCK_MS };
  }
  return { fallos, bloqueadoHasta: state.bloqueadoHasta };
}

/** Reinicia el contador tras un intento válido. */
export function resetAttempts(): AttemptsState {
  return { ...INITIAL_ATTEMPTS };
}

/**
 * Normaliza un estado leído de almacenamiento: si el bloqueo ya expiró en
 * `now`, lo limpia. Útil al arrancar la pantalla.
 */
export function clearExpiredLock(
  state: AttemptsState,
  now: number,
): AttemptsState {
  if (state.bloqueadoHasta !== null && state.bloqueadoHasta <= now) {
    return { fallos: 0, bloqueadoHasta: null };
  }
  return state;
}
