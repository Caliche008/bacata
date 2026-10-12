/**
 * API pública del editor de contenido local del docente.
 *
 * Expone un `default` además del nombrado para permitir que el panel docente lo
 * cargue con `React.lazy(() => import('./editor'))`, dejándolo en un chunk
 * aparte que no pesa en el arranque del estudiante.
 */
export { EditorContenido } from './EditorContenido';
export { EditorContenido as default } from './EditorContenido';
export type { EditorContenidoProps } from './EditorContenido';
