import type { Curso } from '../../content';
import {
  getGamification,
  getProgressByStudent,
  putGamification,
  type Gamificacion,
} from '../../lib/storage';
import type { ResumenLeccion } from '../lessons/answers';
import { XP } from './constants';
import {
  calcularAvanceEjePaz,
  calcularRacha,
  calcularXpLeccion,
  fechaLocalHoy,
  type AvanceEjePaz,
} from './gamification';
import { evaluarLogros } from './logros';

/**
 * Wrapper de persistencia de la gamificación (tarea 10.2). Usa SOLO la API de
 * `src/lib/storage` (nunca IndexedDB directo). Combina las reglas puras de
 * `gamification.ts`/`logros.ts` con el estado guardado. No conoce React.
 *
 * Privacidad (Ley 1581): la gamificación se asocia a `estudianteId` interno, sin
 * PII. Nunca lee ni registra `docentePinHash`.
 *
 * Determinismo: `hoy` (`YYYY-MM-DD`) se puede inyectar para pruebas; si falta,
 * se usa la fecha local real.
 */

/** Estado inicial de gamificación de un estudiante nuevo. */
function gamificacionInicial(estudianteId: string): Gamificacion {
  return {
    estudianteId,
    xp: 0,
    rachaActual: 0,
    mejorRacha: 0,
    ultimaFechaActiva: '',
    logros: [],
  };
}

/**
 * Devuelve la gamificación del estudiante, inicializándola (en memoria, sin
 * persistir todavía) si aún no existe.
 */
export async function obtenerGamificacion(estudianteId: string): Promise<Gamificacion> {
  const guardada = await getGamification(estudianteId);
  return guardada ?? gamificacionInicial(estudianteId);
}

/** Entrada para registrar una lección completada. */
export interface RegistrarLeccionEntrada {
  estudianteId: string;
  /** Resumen de la lección completada (payload de `onLeccionCompletada`). */
  resumen: ResumenLeccion;
  /** Curso actual (para evaluar logros de unidad). */
  curso: Curso;
  /** Ids de unidades ya 100 % completadas tras esta lección. */
  unidadesCompletadas: readonly string[];
  /** Fecha local `YYYY-MM-DD`; si falta, se usa el día local real. */
  hoy?: string;
}

/** Resultado de registrar una lección: estado nuevo + lo que la UI debe celebrar. */
export interface RegistrarLeccionResultado {
  gamificacion: Gamificacion;
  xpGanada: number;
  reinicioRacha: boolean;
  logrosNuevos: string[];
}

/**
 * Registra una lección completada (R4.1, R4.2, R4.3): lee el estado previo, suma
 * la XP de la lección, aplica la política de racha, evalúa logros nuevos (sin
 * duplicar) y PERSISTE el resultado con `putGamification`. Idempotente respecto
 * a la racha dentro del mismo día (no incrementa dos veces).
 */
export async function registrarLeccionCompletada(
  entrada: RegistrarLeccionEntrada,
): Promise<RegistrarLeccionResultado> {
  const { estudianteId, resumen, curso, unidadesCompletadas } = entrada;
  const hoy = entrada.hoy ?? fechaLocalHoy();

  const previo = await obtenerGamificacion(estudianteId);

  const xpGanada = calcularXpLeccion(resumen);
  const racha = calcularRacha(
    {
      rachaActual: previo.rachaActual,
      mejorRacha: previo.mejorRacha,
      ultimaFechaActiva: previo.ultimaFechaActiva,
    },
    hoy,
  );

  const logrosNuevos = evaluarLogros({
    rachaActual: racha.rachaActual,
    unidadesCompletadas,
    logrosActuales: previo.logros,
    curso,
  });

  const gamificacion: Gamificacion = {
    estudianteId,
    xp: previo.xp + xpGanada,
    rachaActual: racha.rachaActual,
    mejorRacha: racha.mejorRacha,
    ultimaFechaActiva: racha.ultimaFechaActiva,
    logros: [...previo.logros, ...logrosNuevos],
  };

  await putGamification(gamificacion);

  return {
    gamificacion,
    xpGanada,
    reinicioRacha: racha.reinicioRacha,
    logrosNuevos,
  };
}

/** Entrada para registrar una lección de REPASO completada (R14.2). */
export interface RegistrarRepasoEntrada {
  estudianteId: string;
  /** Fecha local `YYYY-MM-DD`; si falta, se usa el día local real. */
  hoy?: string;
}

/** Resultado de registrar un repaso completado: estado nuevo + lo celebrable. */
export interface RegistrarRepasoResultado {
  gamificacion: Gamificacion;
  xpGanada: number;
  reinicioRacha: boolean;
}

/**
 * Registra una lección de REPASO completada (R14.2). A diferencia de una lección
 * normal, aplica EXACTAMENTE `XP.LECCION_REPASO` (+5, constante existente, no se
 * redefine) y la MISMA política de racha (`calcularRacha`), pero NO evalúa
 * logros de unidad (el repaso no completa unidades). Reutiliza las reglas puras
 * existentes y persiste con `putGamification`.
 *
 * Se usa en lugar del enganche `onLeccionCompletada` de lección normal (cuya
 * fórmula da +10): el repaso tiene su propia regla de XP fija.
 */
export async function registrarRepasoCompletado(
  entrada: RegistrarRepasoEntrada,
): Promise<RegistrarRepasoResultado> {
  const { estudianteId } = entrada;
  const hoy = entrada.hoy ?? fechaLocalHoy();

  const previo = await obtenerGamificacion(estudianteId);

  const xpGanada = XP.LECCION_REPASO;
  const racha = calcularRacha(
    {
      rachaActual: previo.rachaActual,
      mejorRacha: previo.mejorRacha,
      ultimaFechaActiva: previo.ultimaFechaActiva,
    },
    hoy,
  );

  const gamificacion: Gamificacion = {
    estudianteId,
    xp: previo.xp + xpGanada,
    rachaActual: racha.rachaActual,
    mejorRacha: racha.mejorRacha,
    ultimaFechaActiva: racha.ultimaFechaActiva,
    logros: previo.logros,
  };

  await putGamification(gamificacion);

  return {
    gamificacion,
    xpGanada,
    reinicioRacha: racha.reinicioRacha,
  };
}

/**
 * Avance en el eje de la Cátedra de la Paz (R12.5) del estudiante: deriva el
 * conjunto de lecciones completadas desde el progreso real y lo cruza con el
 * curso. Nunca divide por cero.
 */
export async function obtenerAvanceEjePaz(
  estudianteId: string,
  curso: Curso,
): Promise<AvanceEjePaz> {
  const progreso = await getProgressByStudent(estudianteId);
  const completadas = new Set(
    progreso
      .filter((registro) => registro.estado === 'completada')
      .map((registro) => registro.leccionId),
  );
  return calcularAvanceEjePaz(curso, completadas);
}
