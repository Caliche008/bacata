import { poseRenderers } from './pose-renderers';
import type { MascotaPose } from './pose-types';
import './mascota.css';

export type MascotaSize = 'sm' | 'md' | 'lg';

export interface MascotaProps {
  pose: MascotaPose;
  size?: MascotaSize;
  /** Microcopy (tono de marca). Si se da, se muestra en una burbuja accesible. */
  message?: string;
  /**
   * Si es true (por defecto), el SVG lleva `aria-hidden` y el `message` es lo
   * que anuncia el lector de pantalla. Si es false, el SVG recibe un título
   * accesible (`accessibleLabel`) y se expone como imagen.
   */
  decorative?: boolean;
  /** Etiqueta accesible cuando `decorative` es false. */
  accessibleLabel?: string;
  /** Anima suavemente la figura (respeta prefers-reduced-motion vía CSS). */
  animated?: boolean;
  className?: string;
}

/**
 * Mascota de Bacatá con protagonismo en los momentos de aprendizaje.
 *
 * - El SVG de la pose es decorativo por defecto (`aria-hidden`); el significado
 *   viaja SIEMPRE en el texto (`message`), que el lector de pantalla anuncia.
 *   Si una pose debe comunicar información por sí sola, pásala con
 *   `decorative={false}` y una `accessibleLabel` en texto.
 * - La pose "animando" (tras un error) tiene tono motivador; nunca se burla.
 */
export function Mascota({
  pose,
  size = 'md',
  message,
  decorative = true,
  accessibleLabel,
  animated = false,
  className,
}: MascotaProps) {
  const PoseRenderer = poseRenderers[pose];
  const artClasses = [
    'bc-mascota__art',
    `bc-mascota__art--${size}`,
    animated ? 'bc-mascota__art--animated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = ['bc-mascota', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses} data-pose={pose}>
      <PoseRenderer
        className={artClasses}
        title={decorative ? undefined : accessibleLabel}
      />
      {message ? <p className="bc-mascota__bubble">{message}</p> : null}
    </div>
  );
}
