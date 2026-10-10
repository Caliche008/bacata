/**
 * Lógica de acceso del docente (orquesta hash + preferencias, sin React).
 *
 * Modo local (R6.5, R8.6): el docente es por DISPOSITIVO. En el primer uso se
 * establece un PIN (se guarda solo su hash); después se ingresa el PIN y, si
 * coincide, se abre una sesión docente separada de la del estudiante.
 *
 * Nunca se registra el PIN ni el hash en logs. Fase 2 traerá cuentas reales.
 */

import {
  clearTeacherSession,
  getTeacherPinHash,
  setTeacherPinHash,
  setTeacherSession,
} from '../../lib/preferences';
import { hashPin, isValidPin, verifyPin } from './pin';

/** Mensajes de error en español (tono Bacatá), como constantes reutilizables. */
export const MENSAJE_PIN_INVALIDO =
  'El PIN debe tener entre 4 y 8 dígitos. Vuelve a intentarlo.';
export const MENSAJE_PIN_INCORRECTO = 'Ese PIN no coincide. Inténtalo de nuevo.';

/** Verdadero si todavía no hay PIN docente en este dispositivo. */
export function necesitaConfigurarPin(): boolean {
  return getTeacherPinHash() === null;
}

/**
 * Establece el PIN del docente en el primer uso: valida el formato, guarda el
 * hash (nunca el PIN en claro) y abre la sesión docente. Lanza con el mensaje
 * de error si el formato no es válido.
 */
export async function configurarPin(pin: string): Promise<void> {
  if (!isValidPin(pin)) {
    throw new Error(MENSAJE_PIN_INVALIDO);
  }
  const hash = await hashPin(pin);
  setTeacherPinHash(hash);
  setTeacherSession(true);
}

/**
 * Ingresa con un PIN existente. Devuelve `true` y abre la sesión si coincide;
 * `false` si no. Si no hay PIN configurado, devuelve `false` (debe configurarse
 * primero).
 */
export async function ingresarConPin(pin: string): Promise<boolean> {
  const hash = getTeacherPinHash();
  if (hash === null) {
    return false;
  }
  const ok = await verifyPin(pin, hash);
  if (ok) {
    setTeacherSession(true);
  }
  return ok;
}

/** Cierra la sesión docente (el hash del PIN permanece para reentrar). */
export function cerrarSesionDocente(): void {
  clearTeacherSession();
}
