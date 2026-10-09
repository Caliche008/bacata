import type { Curso, Unidad } from '../../content';
import { RACHA_LOGRO_DIAS } from './constants';

/**
 * Catálogo y evaluación de LOGROS (tarea 10.1, R4.3). Lógica PURA: sin React,
 * sin IndexedDB. Los logros son hitos PEDAGÓGICOS (completar una unidad, mantener
 * una racha), nunca métricas vacías ni rankings públicos (R4.4). El catálogo es
 * extensible por datos: añadir un `LogroDef` a `LOGROS` basta para un logro fijo,
 * y los de unidad se derivan del curso.
 *
 * Microcopy en español con el tono de marca (`brand.md`): motivador y cálido,
 * nunca de castigo.
 */

/** Definición de un logro (texto de cara al estudiante, en español). */
export interface LogroDef {
  id: string;
  titulo: string;
  descripcion: string;
}

/** Id del logro por mantener la racha de 7 días (R4.3). */
export const LOGRO_RACHA_7 = 'racha-7-dias';

/**
 * Catálogo base de logros FIJOS (no derivados del curso). Extensible: agregar
 * entradas aquí amplía el catálogo sin tocar la lógica de evaluación.
 */
export const LOGROS: readonly LogroDef[] = [
  {
    id: LOGRO_RACHA_7,
    titulo: '¡Una semana de constancia!',
    descripcion: `Repasaste ${RACHA_LOGRO_DIAS} días seguidos. Tu hábito ya está creciendo.`,
  },
] as const;

/** Prefijo de los logros "unidad completada", seguido del id de la unidad. */
export const PREFIJO_UNIDAD_COMPLETADA = 'unidad-completada:';

/**
 * Logro derivado de completar una unidad concreta (hito pedagógico). El id es
 * estable (`unidad-completada:<unidadId>`) para no duplicar y para que la UI lo
 * resuelva por datos. Texto motivador acorde a `brand.md`.
 */
export function logroUnidadCompletada(unidad: Unidad): LogroDef {
  return {
    id: `${PREFIJO_UNIDAD_COMPLETADA}${unidad.id}`,
    titulo: `¡Completaste "${unidad.titulo}"!`,
    descripcion: 'Terminaste la unidad. Así se construye criterio, paso a paso.',
  };
}

/** Entrada para evaluar qué logros nuevos otorgar. */
export interface EntradaLogros {
  /** Racha actual (en días) tras registrar la actividad de hoy. */
  rachaActual: number;
  /** Ids de unidades que ya están 100 % completadas. */
  unidadesCompletadas: readonly string[];
  /** Ids de logros YA otorgados (para no duplicar). */
  logrosActuales: readonly string[];
  /** Curso en curso, para validar que las unidades existen. */
  curso: Curso;
}

/**
 * Devuelve los IDs de logros NUEVOS a otorgar, sin incluir los que ya están en
 * `logrosActuales` (no se re-otorgan). Reúne:
 * - `racha-7-dias` cuando la racha alcanza `RACHA_LOGRO_DIAS` o más.
 * - `unidad-completada:<id>` por cada unidad del curso que esté completada.
 *
 * El orden de salida es estable (racha primero, luego unidades por `orden`).
 */
export function evaluarLogros(entrada: EntradaLogros): string[] {
  const { rachaActual, unidadesCompletadas, logrosActuales, curso } = entrada;
  const yaOtorgados = new Set(logrosActuales);
  const completadas = new Set(unidadesCompletadas);
  const nuevos: string[] = [];

  if (rachaActual >= RACHA_LOGRO_DIAS && !yaOtorgados.has(LOGRO_RACHA_7)) {
    nuevos.push(LOGRO_RACHA_7);
  }

  const unidadesOrdenadas = [...curso.unidades].sort((a, b) => a.orden - b.orden);
  for (const unidad of unidadesOrdenadas) {
    if (!completadas.has(unidad.id)) {
      continue;
    }
    const id = logroUnidadCompletada(unidad).id;
    if (!yaOtorgados.has(id)) {
      nuevos.push(id);
    }
  }

  return nuevos;
}
