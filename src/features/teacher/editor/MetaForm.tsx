import { useId } from 'react';
import { Button, Card } from '../../../components';
import type { Fuente, Meta } from '../../../content/types';
import { CampoError } from './CampoError';
import type { ErroresCampo } from './validation';
import './editor.css';

export interface MetaFormProps {
  meta: Meta;
  /**
   * Errores por campo de la meta (ruta -> mensaje), relativos a la meta:
   * `tema`, `fuente.titulo`, `estado`, etc.
   */
  errores: ErroresCampo;
  /** Edita los campos de la meta sin mutar el original. */
  onEditar: (campos: Partial<Meta>) => void;
}

/** Reemplaza el elemento `i` de una lista de strings sin mutar el original. */
function reemplazar(lista: string[], i: number, valor: string): string[] {
  return lista.map((v, idx) => (idx === i ? valor : v));
}

/**
 * Editor de los metadatos de un ejercicio (R7.7): `tema` (requerido),
 * `etiquetas` (lista editable), `fuente?` opcional (título, autor?, url?,
 * año?), `sensible?` (checkbox), `notaContexto?` (textarea) y `estado`
 * ('borrador' | 'aprobado', radiogroup).
 *
 * Si `sensible` está marcado se sugiere, con un aviso accesible, redactar la
 * nota de contexto (enfoque de dignidad al tratar temas sensibles). Cada
 * control tiene su `label`; los errores se anuncian con `role="alert"`
 * enlazado por `aria-describedby`.
 */
export function MetaForm({ meta, errores, onEditar }: MetaFormProps) {
  const base = useId();
  const idTema = `${base}-tema`;
  const idNota = `${base}-nota`;
  const idSugerencia = `${base}-sugerencia`;
  const idFuenteTitulo = `${base}-fuente-titulo`;
  const idFuenteAutor = `${base}-fuente-autor`;
  const idFuenteUrl = `${base}-fuente-url`;
  const idFuenteAnio = `${base}-fuente-anio`;

  const errTema = errores.tema;
  const errFuenteTitulo = errores['fuente.titulo'];
  const errFuenteUrl = errores['fuente.url'];
  const errFuenteAnio = errores['fuente.anio'];

  const etiquetas = meta.etiquetas;
  const tieneFuente = meta.fuente !== undefined;
  const sugiereNota =
    (meta.sensible ?? false) && (meta.notaContexto ?? '').trim().length === 0;

  const setFuente = (campos: Partial<Fuente>) => {
    const actual: Fuente = meta.fuente ?? { titulo: '' };
    onEditar({ fuente: { ...actual, ...campos } });
  };

  const alternarFuente = (activar: boolean) => {
    onEditar({ fuente: activar ? { titulo: '' } : undefined });
  };

  return (
    <Card title="Metadatos del ejercicio" headingLevel={4} className="bc-editor">
      <div className="bc-editor__form">
        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idTema}>
            Tema
          </label>
          <input
            id={idTema}
            className="bc-editor__input"
            type="text"
            value={meta.tema}
            aria-invalid={errTema ? true : undefined}
            aria-describedby={errTema ? `${idTema}-error` : undefined}
            onChange={(e) => onEditar({ tema: e.target.value })}
          />
          <CampoError id={`${idTema}-error`} mensaje={errTema} />
        </div>

        <fieldset className="bc-editor__field">
          <legend className="bc-editor__label">Etiquetas</legend>
          <ul className="bc-editor__lista">
            {etiquetas.map((etiqueta, i) => {
              const idEtiqueta = `${base}-etiqueta-${i}`;
              return (
                <li key={i} className="bc-editor__fila">
                  <label className="bc-editor__radio" htmlFor={idEtiqueta}>
                    Etiqueta {i + 1}
                  </label>
                  <input
                    id={idEtiqueta}
                    className="bc-editor__input"
                    type="text"
                    value={etiqueta}
                    onChange={(e) =>
                      onEditar({ etiquetas: reemplazar(etiquetas, i, e.target.value) })
                    }
                  />
                  <Button
                    variant="ghost"
                    aria-label={`Quitar etiqueta ${i + 1}`}
                    onClick={() =>
                      onEditar({ etiquetas: etiquetas.filter((_, idx) => idx !== i) })
                    }
                  >
                    Quitar
                  </Button>
                </li>
              );
            })}
          </ul>
          <Button variant="secondary" onClick={() => onEditar({ etiquetas: [...etiquetas, ''] })}>
            Añadir etiqueta
          </Button>
        </fieldset>

        <fieldset className="bc-editor__field">
          <legend className="bc-editor__label">Estado del contenido</legend>
          <div className="bc-editor__grados" role="radiogroup" aria-label="Estado del contenido">
            {(['borrador', 'aprobado'] as const).map((valor) => {
              const checked = meta.estado === valor;
              const etiqueta = valor === 'borrador' ? 'Borrador' : 'Aprobado';
              return (
                <label
                  key={valor}
                  className={`bc-editor__grado${checked ? ' bc-editor__grado--activo' : ''}`}
                >
                  <input
                    type="radio"
                    name={`${base}-estado`}
                    className="bc-editor__radio"
                    value={valor}
                    checked={checked}
                    onChange={() => onEditar({ estado: valor })}
                  />
                  <span>{etiqueta}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="bc-editor__field">
          <label className="bc-editor__check">
            <input
              type="checkbox"
              className="bc-editor__checkbox"
              checked={meta.sensible ?? false}
              aria-describedby={sugiereNota ? idSugerencia : undefined}
              onChange={(e) => onEditar({ sensible: e.target.checked })}
            />
            <span>Este contenido trata un tema sensible (conflicto, memoria histórica)</span>
          </label>
          {sugiereNota ? (
            <p id={idSugerencia} role="alert" className="bc-editor__paz">
              <span aria-hidden="true" className="bc-editor__paz-icono">
                ✎
              </span>
              <span>
                Al marcar un tema como sensible, añade una nota de contexto que lo trate con
                dignidad y enfoque de paz.
              </span>
            </p>
          ) : null}
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idNota}>
            Nota de contexto (opcional)
          </label>
          <textarea
            id={idNota}
            className="bc-editor__textarea"
            value={meta.notaContexto ?? ''}
            onChange={(e) => onEditar({ notaContexto: e.target.value })}
          />
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__check">
            <input
              type="checkbox"
              className="bc-editor__checkbox"
              checked={tieneFuente}
              onChange={(e) => alternarFuente(e.target.checked)}
            />
            <span>Este ejercicio cita una fuente</span>
          </label>
        </div>

        {tieneFuente && meta.fuente ? (
          <fieldset className="bc-editor__field">
            <legend className="bc-editor__label">Fuente</legend>

            <div className="bc-editor__field">
              <label className="bc-editor__label" htmlFor={idFuenteTitulo}>
                Título de la fuente
              </label>
              <input
                id={idFuenteTitulo}
                className="bc-editor__input"
                type="text"
                value={meta.fuente.titulo}
                aria-invalid={errFuenteTitulo ? true : undefined}
                aria-describedby={errFuenteTitulo ? `${idFuenteTitulo}-error` : undefined}
                onChange={(e) => setFuente({ titulo: e.target.value })}
              />
              <CampoError id={`${idFuenteTitulo}-error`} mensaje={errFuenteTitulo} />
            </div>

            <div className="bc-editor__field">
              <label className="bc-editor__label" htmlFor={idFuenteAutor}>
                Autor (opcional)
              </label>
              <input
                id={idFuenteAutor}
                className="bc-editor__input"
                type="text"
                value={meta.fuente.autor ?? ''}
                onChange={(e) =>
                  setFuente({ autor: e.target.value.trim() === '' ? undefined : e.target.value })
                }
              />
            </div>

            <div className="bc-editor__field">
              <label className="bc-editor__label" htmlFor={idFuenteUrl}>
                URL (opcional)
              </label>
              <input
                id={idFuenteUrl}
                className="bc-editor__input"
                type="url"
                value={meta.fuente.url ?? ''}
                aria-invalid={errFuenteUrl ? true : undefined}
                aria-describedby={errFuenteUrl ? `${idFuenteUrl}-error` : undefined}
                onChange={(e) =>
                  setFuente({ url: e.target.value.trim() === '' ? undefined : e.target.value })
                }
              />
              <CampoError id={`${idFuenteUrl}-error`} mensaje={errFuenteUrl} />
            </div>

            <div className="bc-editor__field">
              <label className="bc-editor__label" htmlFor={idFuenteAnio}>
                Año (opcional)
              </label>
              <input
                id={idFuenteAnio}
                className="bc-editor__input"
                type="number"
                inputMode="numeric"
                value={meta.fuente.anio ?? ''}
                aria-invalid={errFuenteAnio ? true : undefined}
                aria-describedby={errFuenteAnio ? `${idFuenteAnio}-error` : undefined}
                onChange={(e) =>
                  setFuente({
                    anio: Number.isNaN(e.target.valueAsNumber)
                      ? undefined
                      : e.target.valueAsNumber,
                  })
                }
              />
              <CampoError id={`${idFuenteAnio}-error`} mensaje={errFuenteAnio} />
            </div>
          </fieldset>
        ) : null}
      </div>
    </Card>
  );
}
