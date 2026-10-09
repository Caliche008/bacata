import type { ContentIndex } from './loader';
import type { Curso, Ejercicio, Grado, Leccion, Unidad } from './types';

/**
 * Selectores puros y tipados sobre el contenido ya cargado (tarea 5).
 *
 * No conocen React, no son `async` y no tocan `src/lib/storage`: operan sobre
 * un `ContentIndex` o sobre entidades ya cargadas (`Curso`/`Unidad`). La UI
 * (tareas 6+) consume solo estos selectores.
 *
 * Decisión de firmas: en el modelo las unidades viven dentro de un `Curso` y
 * las lecciones dentro de una `Unidad` (ver `types.ts`). Para mantener los
 * selectores puros y tipados sin búsqueda global por todos los grados, se pasa
 * la entidad padre (`curso`/`unidad`) en lugar de ids sueltos. `listarUnidades`
 * y `listarLecciones` devuelven COPIAS ordenadas por `orden`; nunca mutan el
 * arreglo original ni regeneran ids.
 */

/** Curso válido para un grado, o `undefined` si no está cargado. */
export function getCursoPorGrado(index: ContentIndex, grado: Grado): Curso | undefined {
  return index.cursosPorGrado.get(grado);
}

/** Unidades del curso en una copia ordenada por `orden` (ascendente). */
export function listarUnidades(curso: Curso): Unidad[] {
  return [...curso.unidades].sort((a, b) => a.orden - b.orden);
}

/** Unidad del curso por id, o `undefined` si no existe. */
export function getUnidad(curso: Curso, unidadId: string): Unidad | undefined {
  return curso.unidades.find((unidad) => unidad.id === unidadId);
}

/** Lecciones de la unidad en una copia ordenada por `orden` (ascendente). */
export function listarLecciones(unidad: Unidad): Leccion[] {
  return [...unidad.lecciones].sort((a, b) => a.orden - b.orden);
}

/** Lección de la unidad por id, o `undefined` si no existe. */
export function getLeccion(unidad: Unidad, leccionId: string): Leccion | undefined {
  return unidad.lecciones.find((leccion) => leccion.id === leccionId);
}

/**
 * Ejercicio por id a través de TODAS las unidades/lecciones del curso ya cargado
 * (R14.2, para armar la lección de repaso). Puro y no `async`: recorre
 * `curso.unidades[].lecciones[].ejercicios[]`. Devuelve `undefined` si el id ya
 * no existe (el contenido empaquetado pudo cambiar de versión). Reutiliza el
 * tipo `Ejercicio`; no duplica el modelo.
 */
export function getEjercicioPorId(curso: Curso, ejercicioId: string): Ejercicio | undefined {
  for (const unidad of curso.unidades) {
    for (const leccion of unidad.lecciones) {
      const ejercicio = leccion.ejercicios.find((e) => e.id === ejercicioId);
      if (ejercicio) {
        return ejercicio;
      }
    }
  }
  return undefined;
}
