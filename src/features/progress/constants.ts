/**
 * Constantes centrales de gamificación (tarea 10.1).
 *
 * La fórmula de XP y la política de racha están DEFINIDAS en `design.md`
 * (sección "Progreso y gamificación") y se implementan tal cual. Estos valores
 * son AJUSTABLES y viven aquí, centralizados, para que un cambio pedagógico no
 * obligue a tocar la lógica. No conocen React ni storage.
 */

/**
 * Puntos de experiencia (XP). Según `design.md` (R4.1):
 * - +10 XP por COMPLETAR una lección.
 * - +2 XP por cada acierto en PRIMER intento.
 * - +0 XP en reintentos (sin penalización por fallar).
 * - +5 XP por completar una lección de REPASO (definida pero sin usar en la
 *   tarea 10; el repaso es la tarea 11).
 */
export const XP = {
  COMPLETAR_LECCION: 10,
  ACIERTO_PRIMER_INTENTO: 2,
  REINTENTO: 0,
  /** Declarada pero NO usada aún: el repaso es la tarea 11. */
  LECCION_REPASO: 5,
} as const;

/** Días seguidos de racha que otorgan el logro "racha de 7 días" (R4.3). */
export const RACHA_LOGRO_DIAS = 7;

/** Tipo de la tabla central de XP (claves tipadas, sin `any`). */
export type XpTabla = typeof XP;
