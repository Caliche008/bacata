/**
 * API pública de la feature `progress` (gamificación — tarea 10).
 *
 * Los consumidores (UI, otras features) importan SOLO desde aquí; no necesitan
 * conocer los archivos internos. Separa reglas PURAS (sin React, sin IndexedDB)
 * del wrapper de persistencia (que usa solo `src/lib/storage`).
 */

// Constantes centrales de XP y racha.
export { XP, RACHA_LOGRO_DIAS } from './constants';
export type { XpTabla } from './constants';

// Reglas puras de XP, racha y avance en eje Paz.
export {
  fechaLocalHoy,
  diferenciaEnDias,
  calcularXpLeccion,
  calcularRacha,
  calcularAvanceEjePaz,
} from './gamification';
export type { RachaPrevia, ResultadoRacha, AvanceEjePaz } from './gamification';

// Catálogo y evaluación de logros.
export {
  LOGROS,
  LOGRO_RACHA_7,
  PREFIJO_UNIDAD_COMPLETADA,
  logroUnidadCompletada,
  evaluarLogros,
} from './logros';
export type { LogroDef, EntradaLogros } from './logros';

// Wrapper de persistencia (solo `src/lib/storage`).
export {
  obtenerGamificacion,
  registrarLeccionCompletada,
  registrarRepasoCompletado,
  obtenerAvanceEjePaz,
} from './gamificacion-store';
export type {
  RegistrarLeccionEntrada,
  RegistrarLeccionResultado,
  RegistrarRepasoEntrada,
  RegistrarRepasoResultado,
} from './gamificacion-store';

// Lógica PURA de repetición espaciada del repaso (R14.3).
export {
  INTERVALO_BASE_DIAS,
  INTERVALO_TOPE_DIAS,
  DIA_MS,
  estaDue,
  seleccionarDue,
  alFallar,
  alAcertarEnRepaso,
} from './repaso';
export type { ResultadoAcierto } from './repaso';

// Wrapper de persistencia del repaso (solo `src/lib/storage`).
export {
  registrarFallo,
  obtenerEjerciciosDue,
  contarDue,
  registrarAciertoRepaso,
  registrarFalloRepaso,
} from './repaso-store';

// Hook de datos de la gamificación (UI) y componentes accesibles.
export { useGamificacion } from './useGamificacion';
export type { EstadoGamificacion, UseGamificacionResult } from './useGamificacion';

export { CabeceraGamificacion } from './CabeceraGamificacion';
export type { CabeceraGamificacionProps } from './CabeceraGamificacion';

export { PanelProgreso } from './PanelProgreso';
export type { PanelProgresoProps } from './PanelProgreso';
