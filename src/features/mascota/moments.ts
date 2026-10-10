/**
 * Momentos de aprendizaje y su combinación pose + microcopy de marca.
 *
 * Esta tabla da protagonismo a la mascota en los puntos clave (bienvenida,
 * acierto, error/ánimo, racha/logro, recordatorio, reflexión) de forma
 * centralizada y desacoplada de las features reales (tareas 7+), que la reusan
 * mediante `getMomento` sin duplicar textos. Los textos siguen brand.md.
 */

import type { MascotaPose } from './pose-types';

export type MascotaMomento =
  | 'bienvenida'
  | 'acierto'
  | 'error'
  | 'racha'
  | 'recordatorio'
  | 'reflexion';

export interface MomentoConfig {
  pose: MascotaPose;
  mensaje: string;
}

const MOMENTOS: Record<MascotaMomento, MomentoConfig> = {
  bienvenida: {
    pose: 'saludando',
    mensaje:
      '¡Hola! Soy tu compañero de ruta. ¿Empezamos a explorar la historia?',
  },
  acierto: {
    pose: 'celebrando',
    mensaje: '¡Muy bien! Así se razona.',
  },
  error: {
    pose: 'animando',
    mensaje: 'Casi. Mira esta pista y vuelve a intentarlo.',
  },
  racha: {
    pose: 'feliz',
    mensaje: '¡Llevas 5 días seguidos! Tu constancia cuenta.',
  },
  recordatorio: {
    pose: 'durmiendo',
    mensaje: 'Hoy te espera una lección corta. Son solo 5 minutos.',
  },
  reflexion: {
    pose: 'pensando',
    mensaje: '¿Quién cuenta esta historia? ¿Qué otras versiones existen?',
  },
};

/** Devuelve la pose y el microcopy de marca para un momento de aprendizaje. */
export function getMomento(momento: MascotaMomento): MomentoConfig {
  return MOMENTOS[momento];
}

/** Lista de momentos (útil para el showcase y pruebas). */
export const MOMENTOS_DISPONIBLES: readonly MascotaMomento[] = [
  'bienvenida',
  'acierto',
  'error',
  'racha',
  'recordatorio',
  'reflexion',
];
