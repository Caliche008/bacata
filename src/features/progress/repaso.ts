import type { Repaso } from '../../lib/storage';
import { reviewId } from '../../lib/storage';

/**
 * Lógica PURA de repetición espaciada del repaso de errores (R14.3).
 *
 * Sin React, sin IndexedDB: solo transforma `Repaso` dados un `ahora` inyectable
 * (epoch ms, default `Date.now()`), para que las pruebas sean deterministas
 * (mismo patrón que `gamification.ts` con `hoy`).
 *
 * FÓRMULA (design.md, repetición espaciada simple), decisión D2 del plan:
 * - El intervalo se mide en días y se deriva de `fallos` como potencia de 2
 *   acotada: `intervalo(fallos) = min(INTERVALO_BASE_DIAS * 2^(fallos-1),
 *   INTERVALO_TOPE_DIAS)`. Modelarlo como función de `fallos` evita depender de
 *   un campo de fecha de creación que el record `Repaso` no tiene.
 * - Al FALLAR: `fallos += 1` y `proximaAparicion = ahora + INTERVALO_BASE_DIAS`
 *   (se reinicia el espaciado al día base: volvió a equivocarse, conviene
 *   repasarlo pronto, R14.1).
 * - Al ACERTAR en repaso: se DUPLICA el intervalo vigente (tope
 *   `INTERVALO_TOPE_DIAS`) y se decrementa `fallos` en 1 (marca de dominio
 *   progresivo). Cuando `fallos` llega a 0 o el intervalo alcanza el tope, el
 *   ejercicio se considera DOMINADO y el record se elimina (no se repasa
 *   indefinidamente).
 * - "Due" = `proximaAparicion <= ahora`.
 *
 * Privacidad (Ley 1581): el `Repaso` solo porta `estudianteId` interno +
 * `ejercicioId`; nunca PII.
 */

/** Primer repaso: al día siguiente. */
export const INTERVALO_BASE_DIAS = 1;
/** Tope de espaciado (días): la progresión es 1→2→4→8→16→32. */
export const INTERVALO_TOPE_DIAS = 32;
/** Milisegundos en un día. */
export const DIA_MS = 86_400_000;

/** Intervalo (en días) vigente derivado del número de `fallos` acumulados. */
function intervaloPorFallos(fallos: number): number {
  if (fallos <= 0) {
    return INTERVALO_BASE_DIAS;
  }
  const crudo = INTERVALO_BASE_DIAS * 2 ** (fallos - 1);
  return Math.min(crudo, INTERVALO_TOPE_DIAS);
}

/** ¿El record está "due" para repasar? (`proximaAparicion <= ahora`). */
export function estaDue(repaso: Repaso, ahora: number = Date.now()): boolean {
  return repaso.proximaAparicion <= ahora;
}

/** Filtra los records due y los ordena por `proximaAparicion` ascendente. */
export function seleccionarDue(repasos: Repaso[], ahora: number = Date.now()): Repaso[] {
  return repasos
    .filter((repaso) => estaDue(repaso, ahora))
    .sort((a, b) => a.proximaAparicion - b.proximaAparicion);
}

/**
 * Estado de repaso tras FALLAR un ejercicio (R14.1). Si no existía, parte de
 * `fallos = 0`. Incrementa `fallos` y reinicia la próxima aparición al día base.
 */
export function alFallar(
  previo: Repaso | undefined,
  estudianteId: string,
  ejercicioId: string,
  ahora: number = Date.now(),
): Repaso {
  const fallos = (previo?.fallos ?? 0) + 1;
  return {
    id: reviewId(estudianteId, ejercicioId),
    estudianteId,
    ejercicioId,
    fallos,
    proximaAparicion: ahora + INTERVALO_BASE_DIAS * DIA_MS,
  };
}

/**
 * Resultado de ACERTAR en repaso (R14.3): `actualizar` con el record espaciado,
 * o `eliminar` cuando el ejercicio queda dominado.
 */
export type ResultadoAcierto =
  | { tipo: 'actualizar'; repaso: Repaso }
  | { tipo: 'eliminar' };

/**
 * Aplica un ACIERTO en repaso: duplica el intervalo vigente (tope
 * `INTERVALO_TOPE_DIAS`) y decrementa `fallos`. Devuelve `{ tipo: 'eliminar' }`
 * cuando el ejercicio queda dominado (`fallos` llega a 0 o el intervalo alcanza
 * el tope).
 */
export function alAcertarEnRepaso(
  previo: Repaso,
  ahora: number = Date.now(),
): ResultadoAcierto {
  const intervaloPrevio = intervaloPorFallos(previo.fallos);
  const nuevoIntervalo = Math.min(intervaloPrevio * 2, INTERVALO_TOPE_DIAS);
  const nuevosFallos = previo.fallos - 1;

  // Dominado: ya no quedan fallos pendientes o se alcanzó el tope de espaciado.
  if (nuevosFallos <= 0 || intervaloPrevio >= INTERVALO_TOPE_DIAS) {
    return { tipo: 'eliminar' };
  }

  return {
    tipo: 'actualizar',
    repaso: {
      ...previo,
      fallos: nuevosFallos,
      proximaAparicion: ahora + nuevoIntervalo * DIA_MS,
    },
  };
}
