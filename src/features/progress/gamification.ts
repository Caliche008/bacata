import type { Curso, Unidad } from '../../content';
import { listarLecciones, listarUnidades } from '../../content';
import type { ResumenLeccion } from '../lessons/answers';
import { XP } from './constants';

/**
 * Reglas PURAS de gamificación (tarea 10.1). Sin React, sin IndexedDB y
 * DETERMINISTAS: la fecha "hoy" se inyecta como parámetro para poder probar
 * rachas sin depender del reloj real. Implementan la fórmula de XP y la política
 * de racha EXACTAS de `design.md` (sección "Progreso y gamificación").
 *
 * Privacidad (Ley 1581): estas reglas solo operan sobre números, fechas y el
 * contenido del curso. No manejan PII ni leen secretos (`docentePinHash`).
 */

/**
 * Fecha local de hoy en formato `YYYY-MM-DD` (día calendario del dispositivo).
 * La racha cuenta por día calendario local (`design.md` R4.2), así que se usa la
 * hora local (no UTC) para derivar el día. `date` es inyectable para pruebas.
 */
export function fechaLocalHoy(date: Date = new Date()): string {
  const anio = date.getFullYear();
  const mes = `${date.getMonth() + 1}`.padStart(2, '0');
  const dia = `${date.getDate()}`.padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Diferencia en días entre dos fechas `YYYY-MM-DD` (`hasta - desde`). Se parsean
 * a medianoche UTC para contar días calendario completos sin que el horario de
 * verano (DST) desplace el resultado. Puede ser negativa si `hasta` es anterior
 * a `desde` (reloj hacia atrás).
 */
export function diferenciaEnDias(desde: string, hasta: string): number {
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  const a = aUtcMedianoche(desde);
  const b = aUtcMedianoche(hasta);
  return Math.round((b - a) / MS_POR_DIA);
}

/** Parsea `YYYY-MM-DD` a epoch ms en medianoche UTC (evita saltos por DST). */
function aUtcMedianoche(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map((parte) => Number.parseInt(parte, 10));
  return Date.UTC(anio, mes - 1, dia);
}

/**
 * XP ganada por COMPLETAR una lección (R4.1):
 * `COMPLETAR_LECCION + aciertosPrimerIntento * ACIERTO_PRIMER_INTENTO`.
 * Los reintentos y los fallos no suman ni restan (REINTENTO = 0, sin
 * penalización). No cuenta la lección de repaso (tarea 11).
 */
export function calcularXpLeccion(resumen: ResumenLeccion): number {
  return XP.COMPLETAR_LECCION + resumen.aciertosPrimerIntento * XP.ACIERTO_PRIMER_INTENTO;
}

/** Estado de racha persistido previo (subconjunto de `Gamificacion`). */
export interface RachaPrevia {
  rachaActual: number;
  mejorRacha: number;
  ultimaFechaActiva: string;
}

/**
 * Resultado del cálculo de racha. `reinicioRacha` marca que la racha volvió a 1
 * tras un salto (>1 día) para que la UI muestre el mensaje motivador (R4.6).
 * `incremento` marca que la racha creció respecto al día anterior.
 */
export interface ResultadoRacha {
  rachaActual: number;
  mejorRacha: number;
  ultimaFechaActiva: string;
  reinicioRacha: boolean;
  incremento: boolean;
}

/**
 * Política de racha de `design.md` (R4.2, R4.7). `previo` es el estado guardado
 * (o `undefined` en la primera actividad). `hoy` es `YYYY-MM-DD` local inyectado.
 *
 * - Sin `previo` (o sin `ultimaFechaActiva`): racha = 1 (primer día).
 * - Mismo día (`diff === 0`): se MANTIENE (no suma de nuevo en el mismo día).
 * - Día siguiente (`diff === 1`): +1.
 * - Salto (`diff > 1`): reinicia a 1 con `reinicioRacha = true`.
 * - Reloj hacia atrás (`diff < 0`): se IGNORA (no cambia racha ni fecha) para
 *   tolerar cambios de hora del dispositivo.
 *
 * `mejorRacha` siempre guarda el máximo histórico (`max(prev, rachaActual)`).
 */
export function calcularRacha(previo: RachaPrevia | undefined, hoy: string): ResultadoRacha {
  if (!previo || !previo.ultimaFechaActiva) {
    return {
      rachaActual: 1,
      mejorRacha: Math.max(previo?.mejorRacha ?? 0, 1),
      ultimaFechaActiva: hoy,
      reinicioRacha: false,
      incremento: true,
    };
  }

  const diff = diferenciaEnDias(previo.ultimaFechaActiva, hoy);

  // Reloj hacia atrás: ignorar por completo (no mover racha ni fecha).
  if (diff < 0) {
    return {
      rachaActual: previo.rachaActual,
      mejorRacha: previo.mejorRacha,
      ultimaFechaActiva: previo.ultimaFechaActiva,
      reinicioRacha: false,
      incremento: false,
    };
  }

  // Mismo día: se mantiene (sin doble conteo).
  if (diff === 0) {
    return {
      rachaActual: previo.rachaActual,
      mejorRacha: previo.mejorRacha,
      ultimaFechaActiva: previo.ultimaFechaActiva,
      reinicioRacha: false,
      incremento: false,
    };
  }

  // Día siguiente: +1. Salto (>1 día): reinicia a 1.
  const reinicioRacha = diff > 1;
  const rachaActual = reinicioRacha ? 1 : previo.rachaActual + 1;
  return {
    rachaActual,
    mejorRacha: Math.max(previo.mejorRacha, rachaActual),
    ultimaFechaActiva: hoy,
    reinicioRacha,
    incremento: !reinicioRacha,
  };
}

/** Avance en el eje de la Cátedra de la Paz (R12.5). */
export interface AvanceEjePaz {
  /** 0..100, redondeado. 0 si no hay lecciones de eje Paz (sin dividir por cero). */
  porcentaje: number;
  completadas: number;
  total: number;
}

/**
 * Porcentaje de lecciones completadas que pertenecen a unidades con
 * `ejePaz === true` (R12.5). La Cátedra de la Paz es eje transversal, así que
 * esto mide avance a lo largo de todo el curso. Nunca divide por cero: si no hay
 * lecciones de eje Paz, devuelve 0 %.
 */
export function calcularAvanceEjePaz(
  curso: Curso,
  leccionesCompletadas: Set<string>,
): AvanceEjePaz {
  const unidadesPaz: Unidad[] = listarUnidades(curso).filter((unidad) => unidad.ejePaz);
  const leccionesPaz = unidadesPaz.flatMap((unidad) => listarLecciones(unidad));
  const total = leccionesPaz.length;
  if (total === 0) {
    return { porcentaje: 0, completadas: 0, total: 0 };
  }
  const completadas = leccionesPaz.filter((leccion) => leccionesCompletadas.has(leccion.id)).length;
  return {
    porcentaje: Math.round((completadas / total) * 100),
    completadas,
    total,
  };
}
