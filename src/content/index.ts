/**
 * API pública del módulo de contenido de Bacatá.
 *
 * La UI (tareas 6+) importa SOLO desde aquí: no necesita conocer los archivos
 * internos (`loader.ts`, `selectors.ts`). No se reexporta nada de
 * `src/lib/storage`: el loader ya aísla esa capa.
 */

// Esquema (fuente única de la verdad) y tipos derivados.
export { cursoSchema } from './schema';
export type {
  Grado,
  EstadoContenido,
  Fuente,
  Meta,
  OpcionEvaluable,
  OpcionMultiple,
  VerdaderoFalso,
  Emparejar,
  Ordenar,
  Completar,
  Dilema,
  AnalisisFuente,
  Ejercicio,
  Base,
  Leccion,
  Unidad,
  Curso,
} from './types';

// Loader de contenido empaquetado y caché por grado.
export { loadBundledCourses, initContent, isNewerVersion } from './loader';
export type { ContentIndex, ContentLoadError } from './loader';

// Selectores puros.
export {
  getCursoPorGrado,
  listarUnidades,
  getUnidad,
  listarLecciones,
  getLeccion,
} from './selectors';
