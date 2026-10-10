/**
 * API pública de la feature de mascota de Bacatá.
 */

export { Mascota } from './Mascota';
export type { MascotaProps, MascotaSize } from './Mascota';

export { poseRenderers } from './pose-renderers';
export type { MascotaPose, PoseProps } from './pose-types';

export { getMomento, MOMENTOS_DISPONIBLES } from './moments';
export type { MascotaMomento, MomentoConfig } from './moments';
