/**
 * API pública de la feature de ruta de aprendizaje (features/lessons).
 * El gate en `src/app` consume `RutaAprendizaje`; los tipos puros se exponen
 * para pruebas y features futuras (progreso, lecciones).
 */

export { RutaAprendizaje } from './RutaAprendizaje';
export { ContenidoNoDisponible } from './ContenidoNoDisponible';

export {
  construirRuta,
  leccionesCompletadas,
  porcentajeUnidad,
  unidadesActivasOrdenadas,
} from './path';
export type {
  EstadoLeccion,
  LeccionVista,
  UnidadVista,
  RutaVista,
} from './path';

// Motor de ejercicios y flujo de lección (tarea 9). Se exponen el evaluador puro
// y los tipos de respuesta/resumen para pruebas y para el enganche de XP (tarea 10).
export { evaluarEjercicio, esEvaluable } from './evaluate';
export type {
  Respuesta,
  ResultadoEvaluacion,
  DetalleAnalisis,
  ResumenLeccion,
} from './answers';
