import { useId } from 'react';
import type { VerdaderoFalso } from '../../../../content/types';
import { CampoError } from '../CampoError';
import type { ErroresCampo } from '../validation';
import '../editor.css';

export interface VerdaderoFalsoFieldsProps {
  ejercicio: VerdaderoFalso;
  errores: ErroresCampo;
  onEditar: (
    campos: Partial<Pick<VerdaderoFalso, 'respuestaCorrecta' | 'justificacion'>>,
  ) => void;
}

/**
 * Sub-formulario de `verdadero_falso`: la respuesta correcta (radiogroup
 * Verdadero/Falso) y la `justificacion` (requerida), que ES la
 * retroalimentación formativa del tipo. Controles con `label` asociada; el
 * error de la justificación se anuncia con `role="alert"`.
 */
export function VerdaderoFalsoFields({
  ejercicio,
  errores,
  onEditar,
}: VerdaderoFalsoFieldsProps) {
  const base = useId();
  const idJustificacion = `${base}-justificacion`;
  const errJustificacion = errores.justificacion;

  return (
    <>
      <fieldset className="bc-editor__field">
        <legend className="bc-editor__label">Respuesta correcta</legend>
        <div
          className="bc-editor__grados"
          role="radiogroup"
          aria-label="Respuesta correcta"
        >
          {([true, false] as const).map((valor) => {
            const checked = ejercicio.respuestaCorrecta === valor;
            const etiqueta = valor ? 'Verdadero' : 'Falso';
            return (
              <label
                key={etiqueta}
                className={`bc-editor__grado${checked ? ' bc-editor__grado--activo' : ''}`}
              >
                <input
                  type="radio"
                  name={`${base}-respuesta`}
                  className="bc-editor__radio"
                  checked={checked}
                  onChange={() => onEditar({ respuestaCorrecta: valor })}
                />
                <span>{etiqueta}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="bc-editor__field">
        <label className="bc-editor__label" htmlFor={idJustificacion}>
          Justificación
        </label>
        <textarea
          id={idJustificacion}
          className="bc-editor__textarea"
          value={ejercicio.justificacion}
          aria-invalid={errJustificacion ? true : undefined}
          aria-describedby={errJustificacion ? `${idJustificacion}-error` : undefined}
          onChange={(e) => onEditar({ justificacion: e.target.value })}
        />
        <CampoError id={`${idJustificacion}-error`} mensaje={errJustificacion} />
      </div>
    </>
  );
}
