import { useId } from 'react';
import { Button } from '../../../../components';
import type { AnalisisFuente, OpcionEvaluable } from '../../../../content/types';
import { CampoError } from '../CampoError';
import type { ErroresCampo } from '../validation';
import '../editor.css';

type Pregunta = AnalisisFuente['preguntas'][number];
type Recurso = AnalisisFuente['recurso'];

export interface AnalisisFuenteFieldsProps {
  ejercicio: AnalisisFuente;
  errores: ErroresCampo;
  onEditar: (campos: Partial<Pick<AnalisisFuente, 'recurso' | 'preguntas'>>) => void;
}

/** Reemplaza la opción `k` de la pregunta `j` sin mutar las listas originales. */
function reemplazarOpcion(
  preguntas: Pregunta[],
  j: number,
  k: number,
  campos: Partial<OpcionEvaluable>,
): Pregunta[] {
  return preguntas.map((p, idx) =>
    idx === j
      ? { ...p, opciones: p.opciones.map((o, m) => (m === k ? { ...o, ...campos } : o)) }
      : p,
  );
}

/** Recurso de texto vacío (al cambiar de clase). */
const recursoTexto: Recurso = { clase: 'texto', contenido: '' };
/** Recurso de imagen vacío; `alt` es OBLIGATORIO (accesibilidad). */
const recursoImagen: Recurso = { clase: 'imagen', src: '', alt: '' };

/**
 * Sub-formulario de `analisis_fuente`: un recurso (texto o imagen) y preguntas
 * con opciones evaluables. Si el recurso es imagen, el texto alternativo
 * (`alt`) es OBLIGATORIO para accesibilidad (lo exige el esquema y lo refuerza
 * la UI). La opción correcta de cada pregunta se marca con casilla (no solo
 * color) y las `retro?` por opción cubren la regla formativa.
 */
export function AnalisisFuenteFields({
  ejercicio,
  errores,
  onEditar,
}: AnalisisFuenteFieldsProps) {
  const base = useId();
  const recurso = ejercicio.recurso;
  const preguntas = ejercicio.preguntas;

  const errContenido = errores['recurso.contenido'];
  const errSrc = errores['recurso.src'];
  const errAlt = errores['recurso.alt'];
  const errPreguntas = errores.preguntas;

  const idClaseTexto = `${base}-clase-texto`;
  const idClaseImagen = `${base}-clase-imagen`;
  const idContenido = `${base}-contenido`;
  const idSrc = `${base}-src`;
  const idAlt = `${base}-alt`;

  const anadirPregunta = () =>
    onEditar({
      preguntas: [
        ...preguntas,
        {
          id: `pr-${preguntas.length + 1}`,
          pregunta: '',
          opciones: [{ id: 'op-1', texto: '', esCorrecta: false }],
        },
      ],
    });

  return (
    <>
      <fieldset className="bc-editor__field">
        <legend className="bc-editor__label">Tipo de recurso</legend>
        <div className="bc-editor__grados" role="radiogroup" aria-label="Tipo de recurso">
          <label
            className={`bc-editor__grado${recurso.clase === 'texto' ? ' bc-editor__grado--activo' : ''}`}
          >
            <input
              id={idClaseTexto}
              type="radio"
              name={`${base}-clase`}
              className="bc-editor__radio"
              checked={recurso.clase === 'texto'}
              onChange={() => onEditar({ recurso: recursoTexto })}
            />
            <span>Texto</span>
          </label>
          <label
            className={`bc-editor__grado${recurso.clase === 'imagen' ? ' bc-editor__grado--activo' : ''}`}
          >
            <input
              id={idClaseImagen}
              type="radio"
              name={`${base}-clase`}
              className="bc-editor__radio"
              checked={recurso.clase === 'imagen'}
              onChange={() => onEditar({ recurso: recursoImagen })}
            />
            <span>Imagen</span>
          </label>
        </div>
      </fieldset>

      {recurso.clase === 'texto' ? (
        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idContenido}>
            Contenido del recurso de texto
          </label>
          <textarea
            id={idContenido}
            className="bc-editor__textarea"
            value={recurso.contenido}
            aria-invalid={errContenido ? true : undefined}
            aria-describedby={errContenido ? `${idContenido}-error` : undefined}
            onChange={(e) => onEditar({ recurso: { clase: 'texto', contenido: e.target.value } })}
          />
          <CampoError id={`${idContenido}-error`} mensaje={errContenido} />
        </div>
      ) : (
        <>
          <div className="bc-editor__field">
            <label className="bc-editor__label" htmlFor={idSrc}>
              Dirección (src) de la imagen
            </label>
            <input
              id={idSrc}
              className="bc-editor__input"
              type="text"
              value={recurso.src}
              aria-invalid={errSrc ? true : undefined}
              aria-describedby={errSrc ? `${idSrc}-error` : undefined}
              onChange={(e) => onEditar({ recurso: { ...recurso, src: e.target.value } })}
            />
            <CampoError id={`${idSrc}-error`} mensaje={errSrc} />
          </div>
          <div className="bc-editor__field">
            <label className="bc-editor__label" htmlFor={idAlt}>
              Texto alternativo (alt) — obligatorio para accesibilidad
            </label>
            <input
              id={idAlt}
              className="bc-editor__input"
              type="text"
              value={recurso.alt}
              required
              aria-required="true"
              aria-invalid={errAlt ? true : undefined}
              aria-describedby={errAlt ? `${idAlt}-error` : undefined}
              onChange={(e) => onEditar({ recurso: { ...recurso, alt: e.target.value } })}
            />
            <CampoError id={`${idAlt}-error`} mensaje={errAlt} />
          </div>
        </>
      )}

      <fieldset className="bc-editor__field">
        <legend className="bc-editor__label">Preguntas sobre la fuente</legend>
        <ul className="bc-editor__lista" aria-describedby={errPreguntas ? `${base}-error` : undefined}>
          {preguntas.map((pregunta, j) => {
            const idPregunta = `${base}-pr-${j}`;
            return (
              <li key={pregunta.id} className="bc-editor__opcion">
                <div className="bc-editor__field">
                  <label className="bc-editor__label" htmlFor={idPregunta}>
                    Pregunta {j + 1}
                  </label>
                  <input
                    id={idPregunta}
                    className="bc-editor__input"
                    type="text"
                    value={pregunta.pregunta}
                    onChange={(e) =>
                      onEditar({
                        preguntas: preguntas.map((p, idx) =>
                          idx === j ? { ...p, pregunta: e.target.value } : p,
                        ),
                      })
                    }
                  />
                </div>

                <fieldset className="bc-editor__field">
                  <legend className="bc-editor__label">Opciones de la pregunta {j + 1}</legend>
                  <ul className="bc-editor__lista">
                    {pregunta.opciones.map((opcion, k) => {
                      const idOpTexto = `${base}-pr${j}-op${k}`;
                      const idOpRetro = `${base}-pr${j}-retro${k}`;
                      return (
                        <li key={opcion.id} className="bc-editor__opcion">
                          <div className="bc-editor__field">
                            <label className="bc-editor__label" htmlFor={idOpTexto}>
                              Opción {k + 1}
                            </label>
                            <input
                              id={idOpTexto}
                              className="bc-editor__input"
                              type="text"
                              value={opcion.texto}
                              onChange={(e) =>
                                onEditar({
                                  preguntas: reemplazarOpcion(preguntas, j, k, {
                                    texto: e.target.value,
                                  }),
                                })
                              }
                            />
                          </div>
                          <label className="bc-editor__check">
                            <input
                              type="checkbox"
                              className="bc-editor__checkbox"
                              checked={opcion.esCorrecta}
                              onChange={(e) =>
                                onEditar({
                                  preguntas: reemplazarOpcion(preguntas, j, k, {
                                    esCorrecta: e.target.checked,
                                  }),
                                })
                              }
                            />
                            <span>Es la respuesta correcta</span>
                          </label>
                          <div className="bc-editor__field">
                            <label className="bc-editor__label" htmlFor={idOpRetro}>
                              Retroalimentación de la opción (opcional)
                            </label>
                            <textarea
                              id={idOpRetro}
                              className="bc-editor__textarea"
                              value={opcion.retro ?? ''}
                              onChange={(e) =>
                                onEditar({
                                  preguntas: reemplazarOpcion(preguntas, j, k, {
                                    retro: e.target.value.trim() === '' ? undefined : e.target.value,
                                  }),
                                })
                              }
                            />
                          </div>
                          <Button
                            variant="ghost"
                            aria-label={`Quitar la opción ${k + 1} de la pregunta ${j + 1}`}
                            onClick={() =>
                              onEditar({
                                preguntas: preguntas.map((p, idx) =>
                                  idx === j
                                    ? { ...p, opciones: p.opciones.filter((_, m) => m !== k) }
                                    : p,
                                ),
                              })
                            }
                          >
                            Quitar opción
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      onEditar({
                        preguntas: preguntas.map((p, idx) =>
                          idx === j
                            ? {
                                ...p,
                                opciones: [
                                  ...p.opciones,
                                  {
                                    id: `op-${p.opciones.length + 1}`,
                                    texto: '',
                                    esCorrecta: false,
                                  },
                                ],
                              }
                            : p,
                        ),
                      })
                    }
                  >
                    Añadir opción a la pregunta {j + 1}
                  </Button>
                </fieldset>

                <Button
                  variant="ghost"
                  aria-label={`Quitar la pregunta ${j + 1}`}
                  onClick={() =>
                    onEditar({ preguntas: preguntas.filter((_, idx) => idx !== j) })
                  }
                >
                  Quitar pregunta
                </Button>
              </li>
            );
          })}
        </ul>
        <CampoError id={`${base}-error`} mensaje={errPreguntas} />
        <Button variant="secondary" onClick={anadirPregunta}>
          Añadir pregunta
        </Button>
      </fieldset>
    </>
  );
}
