import { useId } from 'react';
import { Button } from '../../../../components';
import type { Dilema } from '../../../../content/types';
import { CampoError } from '../CampoError';
import type { ErroresCampo } from '../validation';
import '../editor.css';

type OpcionDilema = Dilema['opciones'][number];

export interface DilemaFieldsProps {
  ejercicio: Dilema;
  errores: ErroresCampo;
  onEditar: (campos: Partial<Pick<Dilema, 'escenario' | 'opciones'>>) => void;
}

/** Reemplaza la opción `i` sin mutar la lista original. */
function reemplazar(
  opciones: OpcionDilema[],
  i: number,
  campos: Partial<OpcionDilema>,
): OpcionDilema[] {
  return opciones.map((o, idx) => (idx === i ? { ...o, ...campos } : o));
}

/**
 * Sub-formulario de `dilema`: el `escenario` y las opciones de postura. NO hay
 * campo de "respuesta correcta" (el `.strict()` del esquema lo prohíbe): un
 * dilema no tiene única respuesta, refuerza criterio y empatía. Cada opción
 * lleva su `reflexion` (requerida), que es su retroalimentación formativa.
 */
export function DilemaFields({ ejercicio, errores, onEditar }: DilemaFieldsProps) {
  const base = useId();
  const idEscenario = `${base}-escenario`;
  const opciones = ejercicio.opciones;
  const errEscenario = errores.escenario;
  const errOpciones = errores.opciones;

  const anadir = () =>
    onEditar({
      opciones: [...opciones, { id: `op-${opciones.length + 1}`, texto: '', reflexion: '' }],
    });

  return (
    <>
      <div className="bc-editor__field">
        <label className="bc-editor__label" htmlFor={idEscenario}>
          Escenario del dilema
        </label>
        <textarea
          id={idEscenario}
          className="bc-editor__textarea"
          value={ejercicio.escenario}
          aria-invalid={errEscenario ? true : undefined}
          aria-describedby={errEscenario ? `${idEscenario}-error` : undefined}
          onChange={(e) => onEditar({ escenario: e.target.value })}
        />
        <CampoError id={`${idEscenario}-error`} mensaje={errEscenario} />
      </div>

      <p className="bc-editor__paz">
        <span aria-hidden="true" className="bc-editor__paz-icono">
          ☮
        </span>
        <span>
          Un dilema no tiene una única respuesta correcta: cada postura lleva una reflexión que
          invita a pensar con criterio y empatía.
        </span>
      </p>

      <fieldset className="bc-editor__field">
        <legend className="bc-editor__label">Posturas</legend>
        <ul className="bc-editor__lista" aria-describedby={errOpciones ? `${base}-error` : undefined}>
          {opciones.map((opcion, i) => {
            const idTexto = `${base}-texto-${i}`;
            const idReflexion = `${base}-reflexion-${i}`;
            return (
              <li key={opcion.id} className="bc-editor__opcion">
                <div className="bc-editor__field">
                  <label className="bc-editor__label" htmlFor={idTexto}>
                    Postura {i + 1}
                  </label>
                  <input
                    id={idTexto}
                    className="bc-editor__input"
                    type="text"
                    value={opcion.texto}
                    onChange={(e) => onEditar({ opciones: reemplazar(opciones, i, { texto: e.target.value }) })}
                  />
                </div>
                <div className="bc-editor__field">
                  <label className="bc-editor__label" htmlFor={idReflexion}>
                    Reflexión de la postura {i + 1}
                  </label>
                  <textarea
                    id={idReflexion}
                    className="bc-editor__textarea"
                    value={opcion.reflexion}
                    onChange={(e) =>
                      onEditar({ opciones: reemplazar(opciones, i, { reflexion: e.target.value }) })
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  aria-label={`Quitar la postura ${i + 1}`}
                  onClick={() => onEditar({ opciones: opciones.filter((_, idx) => idx !== i) })}
                >
                  Quitar postura
                </Button>
              </li>
            );
          })}
        </ul>
        <CampoError id={`${base}-error`} mensaje={errOpciones} />
        <Button variant="secondary" onClick={anadir}>
          Añadir postura
        </Button>
      </fieldset>
    </>
  );
}
