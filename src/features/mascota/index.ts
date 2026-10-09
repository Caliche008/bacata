/**
 * API pública de la feature de mascota de Bacatá.
 */

export { Mascota } from './Mascota';
export type { MascotaProps, MascotaSize } from './Mascota';

export { poseRenderers } from './poses';
export type { MascotaPose, PoseProps } from './poses';

export { getMomento, MOMENTOS_DISPONIBLES } from './moments';
export type { MascotaMomento, MomentoConfig } from './moments';
