import { useId } from 'react';
import { Button } from '../../../../components';
import type { OpcionEvaluable, OpcionMultiple } from '../../../../content/types';
import { CampoError } from '../CampoError';
import type { ErroresCampo } from '../validation';
import '../editor.css';

export interface OpcionMultipleFieldsProps {
  ejercicio: OpcionMultiple;
  errores: ErroresCampo;
  onEditar: (campos: Partial<Pick<OpcionMultiple, 'opciones'>>) => void;
}

/** Reemplaza la opción `i` sin mutar la lista original. */
function reemplazar(
  opciones: OpcionEvaluable[],
  i: number,
  campos: Partial<OpcionEvaluable>,
): OpcionEvaluable[] {
  return opciones.map((o, idx) => (idx === i ? { ...o, ...campos } : o));
}

/**
 * Sub-formulario de `opcion_multiple`: lista editable de opciones (texto,
 * `esCorrecta` como checkbox y una `retro?` opcional por opción). La
 * retroalimentación por opción cubre la regla formativa del `ejercicioSchema`.
 * Cada control tiene su `label`; la opción correcta se marca con casilla (no
 * solo color) y los errores se anuncian con `role="alert"`.
 */
export function OpcionMultipleFields({
  ejercicio,
  errores,
  onEditar,
}: OpcionMultipleFieldsProps) {
  const base = useId();
  const opciones = ejercicio.opciones;
  const errOpciones = errores.opciones;

  const anadir = () =>
    onEditar({
      opciones: [...opciones, { id: `op-${opciones.length + 1}`, texto: '', esCorrecta: false }],
    });

  return (
    <fieldset className="bc-editor__field">
      <legend className="bc-editor__label">Opciones</legend>
      <ul className="bc-editor__lista" aria-describedby={errOpciones ? `${base}-error` : undefined}>
        {opciones.map((opcion, i) => {
          const idTexto = `${base}-texto-${i}`;
          const idRetro = `${base}-retro-${i}`;
          return (
            <li key={opcion.id} className="bc-editor__opcion">
              <div className="bc-editor__field">
                <label className="bc-editor__label" htmlFor={idTexto}>
                  Opción {i + 1}
                </label>
                <input
                  id={idTexto}
                  className="bc-editor__input"
                  type="text"
                  value={opcion.texto}
                  onChange={(e) => onEditar({ opciones: reemplazar(opciones, i, { texto: e.target.value }) })}
                />
              </div>
              <label className="bc-editor__check">
                <input
                  type="checkbox"
                  className="bc-editor__checkbox"
                  checked={opcion.esCorrecta}
                  onChange={(e) =>
                    onEditar({ opciones: reemplazar(opciones, i, { esCorrecta: e.target.checked }) })
                  }
                />
                <span>Es la respuesta correcta</span>
              </label>
              <div className="bc-editor__field">
                <label className="bc-editor__label" htmlFor={idRetro}>
                  Retroalimentación de la opción (opcional)
                </label>
                <textarea
                  id={idRetro}
                  className="bc-editor__textarea"
                  value={opcion.retro ?? ''}
                  onChange={(e) =>
                    onEditar({
                      opciones: reemplazar(opciones, i, {
                        retro: e.target.value.trim() === '' ? undefined : e.target.value,
                      }),
                    })
                  }
                />
              </div>
              <Button
                variant="ghost"
                aria-label={`Quitar opción ${i + 1}`}
                onClick={() => onEditar({ opciones: opciones.filter((_, idx) => idx !== i) })}
              >
                Quitar opción
              </Button>
            </li>
          );
        })}
      </ul>
      <CampoError id={`${base}-error`} mensaje={errOpciones} />
      <Button variant="secondary" onClick={anadir}>
        Añadir opción
      </Button>
    </fieldset>
  );
}
