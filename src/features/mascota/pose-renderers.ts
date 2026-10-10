/**
 * Mapa pose -> componente para la mascota de Bacatá.
 *
 * Vive en un archivo `.ts` aparte (sin JSX) y exporta solo este `Record`, de
 * modo que `poses.tsx` quede exportando únicamente componentes y Fast Refresh
 * funcione sin advertencias. Sustituir una pose por arte final no obliga a
 * tocar a los consumidores: basta cambiar su componente en `poses.tsx`.
 */

import type { FC } from 'react';
import type { MascotaPose, PoseProps } from './pose-types';
import {
  Animando,
  Celebrando,
  Durmiendo,
  Feliz,
  Pensando,
  Saludando,
} from './poses';

export const poseRenderers: Record<MascotaPose, FC<PoseProps>> = {
  feliz: Feliz,
  pensando: Pensando,
  celebrando: Celebrando,
  animando: Animando,
  saludando: Saludando,
  durmiendo: Durmiendo,
};
