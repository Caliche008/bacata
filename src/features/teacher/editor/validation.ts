import type { z } from 'zod';
import {
  cursoSchema,
  unidadSchema,
  leccionSchema,
  ejercicioSchema,
} from '../../../content';
import type { Curso, Unidad, Leccion, Ejercicio } from '../../../content/types';

/**
 * Validación en vivo del editor de contenido. Funciones PURAS que reutilizan
 * los sub-esquemas Zod (fuente única de la verdad, NO se redefinen) y devuelven
 * un mapa `ruta -> mensaje` en español para enlazar con `aria-describedby` en
 * los formularios.
 *
 * Un borrador puede estar incompleto mientras se edita, por eso cada sub-objeto
 * (curso, unidad, lección, ejercicio) se valida por separado: así el formulario
 * de una unidad puede mostrar sus errores sin exigir el curso completo.
 *
 * No se registra nada en logs.
 */

/** Mapa de errores por campo: la clave es la ruta Zod unida con puntos. */
export type ErroresCampo = Record<string, string>;

/**
 * Convierte los issues de Zod en un mapa `ruta -> mensaje`. La ruta se une con
 * puntos (p. ej. `catedraPaz.como`, `objetivos.0`) para que los formularios la
 * usen como clave estable al enlazar `aria-describedby`. Si dos issues comparten
 * ruta, se conserva el primero (el más específico que Zod reporta primero).
 */
function mapaDeIssues(issues: z.ZodIssue[]): ErroresCampo {
  const mapa: ErroresCampo = {};
  for (const issue of issues) {
    const ruta = issue.path.join('.');
    if (!(ruta in mapa)) {
      mapa[ruta] = issue.message;
    }
  }
  return mapa;
}

/**
 * Valida un sub-objeto con su esquema y devuelve el mapa de errores por campo.
 * Si es válido, devuelve un mapa vacío. No lanza: usa `safeParse`.
 */
function erroresDe<T>(schema: z.ZodType<T>, valor: unknown): ErroresCampo {
  const resultado = schema.safeParse(valor);
  return resultado.success ? {} : mapaDeIssues(resultado.error.issues);
}

/** Errores por campo de un curso completo (incluye unidades y lecciones anidadas). */
export function erroresCurso(curso: unknown): ErroresCampo {
  return erroresDe<Curso>(cursoSchema, curso);
}

/** Errores por campo de una unidad (sin exigir el curso completo). */
export function erroresUnidad(unidad: unknown): ErroresCampo {
  return erroresDe<Unidad>(unidadSchema, unidad);
}

/** Errores por campo de una lección (sin exigir la unidad ni el curso). */
export function erroresLeccion(leccion: unknown): ErroresCampo {
  return erroresDe<Leccion>(leccionSchema, leccion);
}

/** Errores por campo de un ejercicio (sin exigir la lección ni el curso). */
export function erroresEjercicio(ejercicio: unknown): ErroresCampo {
  return erroresDe<Ejercicio>(ejercicioSchema, ejercicio);
}

/** `true` si el mapa de errores no tiene entradas (el sub-objeto es válido). */
export function sinErrores(errores: ErroresCampo): boolean {
  return Object.keys(errores).length === 0;
}
