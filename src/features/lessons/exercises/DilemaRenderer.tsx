import { useId } from 'react';
import type { Dilema } from '../../../content';
import { Mascota, getMomento } from '../../mascota';
import type { RespuestaDilema } from '../answers';
import type { RendererProps } from './types';

/**
 * Renderizador de dilema (9.2, R3.3). Muestra el `escenario` y las opciones SIN
 * marca de correcto/incorrecto: no hay respuesta única. La mascota en pose
 * "pensando" (`reflexion`) acompaña la reflexión. Accesible: radios con
 * etiquetas, teclado nativo, foco visible, objetivos ≥44px.
 */
export function DilemaRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: RendererProps<Dilema, RespuestaDilema>) {
  const grupo = useId();
  const reflexion = getMomento('reflexion');

  return (
    <div className="bc-dilema">
      <div className="bc-dilema__mascota">
        <Mascota pose={reflexion.pose} size="sm" message={reflexion.mensaje} />
      </div>
      <p className="bc-dilema__escenario">{ejercicio.escenario}</p>
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
                    onChange={() => onChange({ tipo: 'dilema', opcionId: opcion.id })}
                  />
                  <span className="bc-opcion__texto">{opcion.texto}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}
