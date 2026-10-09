import type { Ejercicio } from '../../../content';
import type { Respuesta } from '../answers';

/**
 * Contrato común de los renderizadores de ejercicio (tarea 9.2). Cada
 * renderizador es CONTROLADO: recibe la respuesta en curso y notifica cambios
 * por `onChange`; nunca evalúa (eso lo hace el evaluador puro). Cuando
 * `deshabilitado` es true (fase de feedback), los controles quedan inertes para
 * que no se modifique la respuesta tras evaluar.
 */
export interface RendererProps<E extends Ejercicio, R extends Respuesta> {
  ejercicio: E;
  respuesta: R;
  onChange: (respuesta: R) => void;
  deshabilitado: boolean;
}
