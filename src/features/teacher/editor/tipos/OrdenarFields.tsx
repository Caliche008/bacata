import { useId } from 'react';
import { Button } from '../../../../components';
import type { Ordenar } from '../../../../content/types';
import { CampoError } from '../CampoError';
import type { ErroresCampo } from '../validation';
import '../editor.css';

type Elemento = Ordenar['elementos'][number];

export interface OrdenarFieldsProps {
  ejercicio: Ordenar;
  errores: ErroresCampo;
  onEditar: (campos: Partial<Pick<Ordenar, 'elementos'>>) => void;
}

/** Renumera `orden` según la posición visible (1-indexado). */
function renumerar(elementos: Elemento[]): Elemento[] {
  return elementos.map((el, i) => ({ ...el, orden: i + 1 }));
}

/** Mueve el elemento `i` una posición y renumera, sin mutar el original. */
function mover(elementos: Elemento[], i: number, direccion: 'subir' | 'bajar'): Elemento[] {
  const hacia = direccion === 'subir' ? i - 1 : i + 1;
  if (hacia < 0 || hacia >= elementos.length) {
    return elementos;
  }
  const copia = [...elementos];
  const [el] = copia.splice(i, 1);
  copia.splice(hacia, 0, el);
  return renumerar(copia);
}

/**
 * Sub-formulario de `ordenar`: elementos con `texto`; el orden correcto es la
 * posición en la lista (se renumera `orden`). Reordenar es accesible mediante
 * botones Subir/Bajar (no solo arrastrar), cada uno con `aria-label`. El error
 * de la lista se anuncia con `role="alert"`.
 */
export function OrdenarFields({ ejercicio, errores, onEditar }: OrdenarFieldsProps) {
  const base = useId();
  const elementos = ejercicio.elementos;
  const errElementos = errores.elementos;

  const anadir = () =>
    onEditar({
      elementos: renumerar([
        ...elementos,
        { id: `el-${elementos.length + 1}`, texto: '', orden: elementos.length + 1 },
      ]),
    });

  return (
    <fieldset className="bc-editor__field">
      <legend className="bc-editor__label">Elementos a ordenar (en el orden correcto)</legend>
      <ol
        className="bc-editor__lista"
        aria-describedby={errElementos ? `${base}-error` : undefined}
      >
        {elementos.map((el, i) => {
          const idTexto = `${base}-texto-${i}`;
          return (
            <li key={el.id} className="bc-editor__opcion">
              <div className="bc-editor__field">
                <label className="bc-editor__label" htmlFor={idTexto}>
                  Elemento en la posición {i + 1}
                </label>
                <input
                  id={idTexto}
                  className="bc-editor__input"
                  type="text"
                  value={el.texto}
                  onChange={(e) =>
                    onEditar({
                      elementos: elementos.map((x, idx) =>
                        idx === i ? { ...x, texto: e.target.value } : x,
                      ),
                    })
                  }
                />
              </div>
              <div className="bc-editor__fila">
                <Button
                  variant="secondary"
                  aria-label={`Subir el elemento ${i + 1}`}
                  disabled={i === 0}
                  onClick={() => onEditar({ elementos: mover(elementos, i, 'subir') })}
                >
                  Subir
                </Button>
                <Button
                  variant="secondary"
                  aria-label={`Bajar el elemento ${i + 1}`}
                  disabled={i === elementos.length - 1}
                  onClick={() => onEditar({ elementos: mover(elementos, i, 'bajar') })}
                >
                  Bajar
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Quitar el elemento ${i + 1}`}
                  onClick={() =>
                    onEditar({ elementos: renumerar(elementos.filter((_, idx) => idx !== i)) })
                  }
                >
                  Quitar
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
      <CampoError id={`${base}-error`} mensaje={errElementos} />
      <Button variant="secondary" onClick={anadir}>
        Añadir elemento
      </Button>
    </fieldset>
  );
}
