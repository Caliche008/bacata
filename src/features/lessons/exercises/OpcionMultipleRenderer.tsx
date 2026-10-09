import { useId } from 'react';
import type { OpcionMultiple } from '../../../content';
import type { RespuestaOpcionMultiple } from '../answers';
import type { RendererProps } from './types';

/**
 * Renderizador de opción múltiple (9.2). Grupo de radios dentro de un
 * `fieldset`/`legend` con el enunciado. Accesible: etiquetas asociadas, teclado
 * nativo del radio, foco visible y objetivos táctiles ≥44px (vía CSS). El estado
 * elegido se refleja también por texto/estructura, no solo por color.
 */
export function OpcionMultipleRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: RendererProps<OpcionMultiple, RespuestaOpcionMultiple>) {
  const grupo = useId();

  return (
    <fieldset className="bc-ejercicio__fieldset" disabled={deshabilitado}>
      <legend className="bc-ejercicio__enunciado">{ejercicio.enunciado}</legend>
      <ul className="bc-opciones">
        {ejercicio.opciones.map((opcion) => {
          const inputId = `${grupo}-${opcion.id}`;
          const seleccionada = respuesta.opcionId === opcion.id;
          return (
            <li key={opcion.id} className="bc-opciones__item">
              <label
                className={`bc-opcion ${seleccionada ? 'bc-opcion--activa' : ''}`}
                htmlFor={inputId}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={grupo}
                  className="bc-opcion__input"
                  checked={seleccionada}
                  disabled={deshabilitado}
                  onChange={() => onChange({ tipo: 'opcion_multiple', opcionId: opcion.id })}
                />
                <span className="bc-opcion__texto">{opcion.texto}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
