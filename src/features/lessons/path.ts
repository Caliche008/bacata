import type { Curso, Unidad } from '../../content';
import { listarLecciones, listarUnidades } from '../../content';
import type { Progreso } from '../../lib/storage';

/**
 * Lógica PURA de la ruta de aprendizaje (tarea 8). Sin React, sin storage, sin
 * `async`: recibe el `Curso` ya cargado, el arreglo `Progreso[]` del store y el
 * filtro de unidades activas, y devuelve la vista de la ruta con estados de
 * desbloqueo y porcentajes. Así es testeable con Vitest sin montar componentes
 * ni IndexedDB.
 *
 * Decisiones de diseño (documentadas aquí porque son el contrato de la lógica):
 *
 * 1. Unidades vacías (`lecciones: []`): se MUESTRAN en la ruta (reflejan la
 *    estructura del curso y la Cátedra de la Paz), pero se OMITEN del cómputo de
 *    desbloqueo. Su porcentaje es 0 % sin dividir por cero y nunca aportan una
 *    "última lección". Al saltar de unidad se busca la siguiente unidad activa
 *    que tenga al menos una lección.
 *
 * 2. Fallback de unidades activas (R6.4): el filtro `activas` es
 *    `string[] | null`. `null` (sin registro de clase, o clase sin
 *    `unidadesActivas`) significa "mostrar TODAS las unidades" — comportamiento
 *    por defecto del MVP. Una lista no vacía filtra a ese conjunto de ids. Una
 *    lista vacía se trata como "ninguna activa" (filtra todo), pero el hook de
 *    datos normaliza el caso vacío a `null` para preservar el fallback.
 *
 * 3. Desbloqueo (R2.2) derivado del progreso: "completada" = existe un
 *    `Progreso` para esa `leccionId` con `estado === 'completada'`. Se aplanan
 *    las unidades activas NO vacías por `orden` y, dentro, sus lecciones por
 *    `orden`, en una secuencia global. La primera lección de esa secuencia está
 *    DISPONIBLE desde el inicio; una lección está DISPONIBLE si la lección
 *    inmediatamente anterior está completada; en otro caso, BLOQUEADA. Como el
 *    aplanado ignora las unidades vacías, completar la última lección de una
 *    unidad habilita la primera de la siguiente unidad activa con lecciones.
 */

export type EstadoLeccion = 'bloqueada' | 'disponible' | 'completada';

export interface LeccionVista {
  id: string;
  titulo: string;
  orden: number;
  estado: EstadoLeccion;
}

export interface UnidadVista {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  /** Cátedra de la Paz como eje transversal, mostrada DENTRO de la unidad. */
  ejePaz: boolean;
  /** `true` si la unidad no tiene lecciones (`lecciones: []`). */
  vacia: boolean;
  /** `true` si la unidad tiene lecciones y todas están completadas. */
  completada: boolean;
  /** 0..100 (redondeado). 0 si la unidad está vacía (sin dividir por cero). */
  porcentaje: number;
  totalLecciones: number;
  completadas: number;
  lecciones: LeccionVista[];
}

export interface RutaVista {
  unidades: UnidadVista[];
}

/** Conjunto de `leccionId` completadas, derivado del store `progreso`. */
export function leccionesCompletadas(progreso: Progreso[]): Set<string> {
  const ids = new Set<string>();
  for (const registro of progreso) {
    if (registro.estado === 'completada') {
      ids.add(registro.leccionId);
    }
  }
  return ids;
}

/**
 * Unidades del curso ya filtradas por `unidadesActivas` y ordenadas por `orden`.
 * `null` = sin filtro (todas). Reutiliza el selector puro `listarUnidades`
 * (que ya ordena y copia); nunca muta el curso original.
 */
export function unidadesActivasOrdenadas(curso: Curso, activas: string[] | null): Unidad[] {
  const ordenadas = listarUnidades(curso);
  if (activas === null) {
    return ordenadas;
  }
  const activasSet = new Set(activas);
  return ordenadas.filter((unidad) => activasSet.has(unidad.id));
}

/**
 * Porcentaje de avance de una unidad: lecciones completadas / total * 100,
 * redondeado. Una unidad vacía devuelve 0 (sin dividir por cero).
 */
export function porcentajeUnidad(unidad: Unidad, completadas: Set<string>): number {
  const lecciones = listarLecciones(unidad);
  if (lecciones.length === 0) {
    return 0;
  }
  const hechas = lecciones.filter((leccion) => completadas.has(leccion.id)).length;
  return Math.round((hechas / lecciones.length) * 100);
}

/**
 * Construye la ruta completa con estados de desbloqueo. Aplana las unidades
 * activas NO vacías por `orden` y, dentro, sus lecciones por `orden`, para
 * derivar la secuencia global que gobierna el desbloqueo (ver decisión 3).
 */
export function construirRuta(
  curso: Curso,
  activas: string[] | null,
  progreso: Progreso[],
): RutaVista {
  const completadas = leccionesCompletadas(progreso);
  const unidades = unidadesActivasOrdenadas(curso, activas);

  // Secuencia global aplanada (solo unidades con lecciones) que gobierna el
  // desbloqueo. El índice en esta secuencia define el "anterior" de cada lección.
  const secuenciaGlobal = unidades.flatMap((unidad) => listarLecciones(unidad));
  const estadoPorId = new Map<string, EstadoLeccion>();
  secuenciaGlobal.forEach((leccion, indice) => {
    if (completadas.has(leccion.id)) {
      estadoPorId.set(leccion.id, 'completada');
      return;
    }
    if (indice === 0) {
      estadoPorId.set(leccion.id, 'disponible');
      return;
    }
    const anterior = secuenciaGlobal[indice - 1];
    estadoPorId.set(leccion.id, completadas.has(anterior.id) ? 'disponible' : 'bloqueada');
  });

  const unidadesVista: UnidadVista[] = unidades.map((unidad) => {
    const lecciones = listarLecciones(unidad);
    const vacia = lecciones.length === 0;
    const completadasEnUnidad = lecciones.filter((leccion) => completadas.has(leccion.id)).length;

    const leccionesVista: LeccionVista[] = lecciones.map((leccion) => ({
      id: leccion.id,
      titulo: leccion.titulo,
      orden: leccion.orden,
      estado: estadoPorId.get(leccion.id) ?? 'bloqueada',
    }));

    return {
      id: unidad.id,
      titulo: unidad.titulo,
      descripcion: unidad.descripcion,
      orden: unidad.orden,
      ejePaz: unidad.ejePaz,
      vacia,
      completada: !vacia && completadasEnUnidad === lecciones.length,
      porcentaje: porcentajeUnidad(unidad, completadas),
      totalLecciones: lecciones.length,
      completadas: completadasEnUnidad,
      lecciones: leccionesVista,
    };
  });

  return { unidades: unidadesVista };
}
