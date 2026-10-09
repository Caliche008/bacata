/**
 * API pública de la feature de ruta de aprendizaje (features/lessons).
 * El gate en `src/app` consume `RutaAprendizaje`; los tipos puros se exponen
 * para pruebas y features futuras (progreso, lecciones).
 */

export { RutaAprendizaje } from './RutaAprendizaje';

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
