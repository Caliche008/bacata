import { useId } from 'react';
import type { VerdaderoFalso } from '../../../content';
import type { RespuestaVerdaderoFalso } from '../answers';
import type { RendererProps } from './types';

/**
 * Renderizador de verdadero/falso (9.2). Dos radios ("Verdadero"/"Falso") dentro
 * de un `fieldset`/`legend`. Accesible: etiquetas, teclado nativo, foco visible,
 * objetivos ≥44px. El estado no depende solo del color.
 */
export function VerdaderoFalsoRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: RendererProps<VerdaderoFalso, RespuestaVerdaderoFalso>) {
  const grupo = useId();

  const opciones: { valor: boolean; etiqueta: string }[] = [
    { valor: true, etiqueta: 'Verdadero' },
    { valor: false, etiqueta: 'Falso' },
  ];

  return (
    <fieldset className="bc-ejercicio__fieldset" disabled={deshabilitado}>
      <legend className="bc-ejercicio__enunciado">{ejercicio.enunciado}</legend>
      <ul className="bc-opciones bc-opciones--vf">
        {opciones.map((opcion) => {
          const inputId = `${grupo}-${opcion.etiqueta}`;
          const seleccionada = respuesta.valor === opcion.valor;
          return (
            <li key={opcion.etiqueta} className="bc-opciones__item">
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
                  onChange={() => onChange({ tipo: 'verdadero_falso', valor: opcion.valor })}
                />
                <span className="bc-opcion__texto">{opcion.etiqueta}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
