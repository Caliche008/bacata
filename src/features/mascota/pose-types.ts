/**
 * Tipos compartidos de las poses de la mascota de Bacatá.
 *
 * Viven en un archivo `.ts` aparte (sin JSX) para que `poses.tsx` exporte
 * únicamente componentes y Fast Refresh funcione sin advertencias.
 */

export type MascotaPose =
  | 'feliz'
  | 'pensando'
  | 'celebrando'
  | 'animando'
  | 'saludando'
  | 'durmiendo';

export interface PoseProps {
  /** Título accesible opcional (se ignora si el SVG es decorativo). */
  title?: string;
  className?: string;
}
