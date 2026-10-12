import { useId } from 'react';
import { Button } from '../../../../components';
import type { Completar } from '../../../../content/types';
import { CampoError } from '../CampoError';
import type { ErroresCampo } from '../validation';
import '../editor.css';

type Hueco = Completar['huecos'][number];

export interface CompletarFieldsProps {
  ejercicio: Completar;
  errores: ErroresCampo;
  onEditar: (campos: Partial<Pick<Completar, 'texto' | 'huecos'>>) => void;
}

/** Reemplaza el hueco `i` sin mutar la lista original. */
function reemplazarHueco(huecos: Hueco[], i: number, campos: Partial<Hueco>): Hueco[] {
  return huecos.map((h, idx) => (idx === i ? { ...h, ...campos } : h));
}

/** Reemplaza la opción `j` del hueco `i`. */
function reemplazarOpcion(huecos: Hueco[], i: number, j: number, valor: string): Hueco[] {
  return huecos.map((h, idx) =>
    idx === i ? { ...h, opciones: h.opciones.map((o, k) => (k === j ? valor : o)) } : h,
  );
}

/**
 * Sub-formulario de `completar`: el `texto` con huecos y, por cada hueco, la
 * lista de `opciones` (mín. 1) y la `correcta` (radiogroup entre las opciones).
 * La correcta se elige con radio (no solo color). Labels asociadas y errores
 * con `role="alert"`.
 */
export function CompletarFields({ ejercicio, errores, onEditar }: CompletarFieldsProps) {
  const base = useId();
  const idTexto = `${base}-texto`;
  const huecos = ejercicio.huecos;
  const errTexto = errores.texto;
  const errHuecos = errores.huecos;

  const anadirHueco = () =>
    onEditar({ huecos: [...huecos, { id: `h-${huecos.length + 1}`, opciones: [''], correcta: '' }] });

  return (
    <>
      <div className="bc-editor__field">
        <label className="bc-editor__label" htmlFor={idTexto}>
          Texto a completar
        </label>
        <textarea
          id={idTexto}
          className="bc-editor__textarea"
          value={ejercicio.texto}
          aria-invalid={errTexto ? true : undefined}
          aria-describedby={errTexto ? `${idTexto}-error` : undefined}
          onChange={(e) => onEditar({ texto: e.target.value })}
        />
        <CampoError id={`${idTexto}-error`} mensaje={errTexto} />
      </div>

      <fieldset className="bc-editor__field">
        <legend className="bc-editor__label">Huecos</legend>
        <ul className="bc-editor__lista" aria-describedby={errHuecos ? `${base}-error` : undefined}>
          {huecos.map((hueco, i) => (
            <li key={hueco.id} className="bc-editor__opcion">
              <fieldset className="bc-editor__field">
                <legend className="bc-editor__label">Opciones del hueco {i + 1}</legend>
                <div
                  role="radiogroup"
                  aria-label={`Opción correcta del hueco ${i + 1}`}
                  className="bc-editor__lista"
                >
                  {hueco.opciones.map((opcion, j) => {
                    const idOpcion = `${base}-h${i}-op${j}`;
                    return (
                      <div key={j} className="bc-editor__fila">
                        <label className="bc-editor__check">
                          <input
                            type="radio"
                            name={`${base}-correcta-${i}`}
                            className="bc-editor__checkbox"
                            checked={hueco.correcta === opcion && opcion.trim() !== ''}
                            aria-label={`Marcar la opción ${j + 1} como correcta`}
                            onChange={() =>
                              onEditar({ huecos: reemplazarHueco(huecos, i, { correcta: opcion }) })
                            }
                          />
                          <span>Correcta</span>
                        </label>
                        <label className="bc-editor__radio" htmlFor={idOpcion}>
                          Opción {j + 1} del hueco {i + 1}
                        </label>
                        <input
                          id={idOpcion}
                          className="bc-editor__input"
                          type="text"
                          value={opcion}
                          onChange={(e) => {
                            const eraCorrecta = hueco.correcta === opcion;
                            const conOpcion = reemplazarOpcion(huecos, i, j, e.target.value);
                            onEditar({
                              huecos: eraCorrecta
                                ? reemplazarHueco(conOpcion, i, { correcta: e.target.value })
                                : conOpcion,
                            });
                          }}
                        />
                        <Button
                          variant="ghost"
                          aria-label={`Quitar la opción ${j + 1} del hueco ${i + 1}`}
                          onClick={() =>
                            onEditar({
                              huecos: reemplazarHueco(huecos, i, {
                                opciones: hueco.opciones.filter((_, k) => k !== j),
                              }),
                            })
                          }
                        >
                          Quitar
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    onEditar({
                      huecos: reemplazarHueco(huecos, i, { opciones: [...hueco.opciones, ''] }),
                    })
                  }
                >
                  Añadir opción al hueco {i + 1}
                </Button>
              </fieldset>
              <Button
                variant="ghost"
                aria-label={`Quitar el hueco ${i + 1}`}
                onClick={() => onEditar({ huecos: huecos.filter((_, idx) => idx !== i) })}
              >
                Quitar hueco
              </Button>
            </li>
          ))}
        </ul>
        <CampoError id={`${base}-error`} mensaje={errHuecos} />
        <Button variant="secondary" onClick={anadirHueco}>
          Añadir hueco
        </Button>
      </fieldset>
    </>
  );
}
