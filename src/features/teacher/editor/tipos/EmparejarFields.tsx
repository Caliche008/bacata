import { useId } from 'react';
import { Button } from '../../../../components';
import type { Emparejar } from '../../../../content/types';
import { CampoError } from '../CampoError';
import type { ErroresCampo } from '../validation';
import '../editor.css';

type Par = Emparejar['pares'][number];

export interface EmparejarFieldsProps {
  ejercicio: Emparejar;
  errores: ErroresCampo;
  onEditar: (campos: Partial<Pick<Emparejar, 'pares'>>) => void;
}

/** Reemplaza el par `i` sin mutar la lista original. */
function reemplazar(pares: Par[], i: number, campos: Partial<Par>): Par[] {
  return pares.map((p, idx) => (idx === i ? { ...p, ...campos } : p));
}

/**
 * Sub-formulario de `emparejar`: lista editable de pares (lado izquierdo ↔
 * lado derecho). Cada campo tiene su `label` asociada; el error de la lista se
 * anuncia con `role="alert"`. Mínimo un par (lo exige el esquema).
 */
export function EmparejarFields({ ejercicio, errores, onEditar }: EmparejarFieldsProps) {
  const base = useId();
  const pares = ejercicio.pares;
  const errPares = errores.pares;

  const anadir = () => onEditar({ pares: [...pares, { izquierda: '', derecha: '' }] });

  return (
    <fieldset className="bc-editor__field">
      <legend className="bc-editor__label">Pares para emparejar</legend>
      <ul className="bc-editor__lista" aria-describedby={errPares ? `${base}-error` : undefined}>
        {pares.map((par, i) => {
          const idIzq = `${base}-izq-${i}`;
          const idDer = `${base}-der-${i}`;
          return (
            <li key={i} className="bc-editor__opcion">
              <div className="bc-editor__field">
                <label className="bc-editor__label" htmlFor={idIzq}>
                  Lado izquierdo del par {i + 1}
                </label>
                <input
                  id={idIzq}
                  className="bc-editor__input"
                  type="text"
                  value={par.izquierda}
                  onChange={(e) => onEditar({ pares: reemplazar(pares, i, { izquierda: e.target.value }) })}
                />
              </div>
              <div className="bc-editor__field">
                <label className="bc-editor__label" htmlFor={idDer}>
                  Lado derecho del par {i + 1}
                </label>
                <input
                  id={idDer}
                  className="bc-editor__input"
                  type="text"
                  value={par.derecha}
                  onChange={(e) => onEditar({ pares: reemplazar(pares, i, { derecha: e.target.value }) })}
                />
              </div>
              <Button
                variant="ghost"
                aria-label={`Quitar par ${i + 1}`}
                onClick={() => onEditar({ pares: pares.filter((_, idx) => idx !== i) })}
              >
                Quitar par
              </Button>
            </li>
          );
        })}
      </ul>
      <CampoError id={`${base}-error`} mensaje={errPares} />
      <Button variant="secondary" onClick={anadir}>
        Añadir par
      </Button>
    </fieldset>
  );
}
