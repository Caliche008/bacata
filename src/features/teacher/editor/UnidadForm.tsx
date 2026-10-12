import { useId } from 'react';
import { Button, Card } from '../../../components';
import type { Unidad } from '../../../content/types';
import { CampoError } from './CampoError';
import type { CamposUnidad } from './useEditorContenido';
import type { ErroresCampo } from './validation';
import './editor.css';

export interface UnidadFormProps {
  unidad: Unidad;
  /**
   * Errores por campo de la unidad (ruta -> mensaje). Las claves son relativas
   * a la unidad: `titulo`, `catedraPaz.como`, `catedraPaz.tematicas`, etc.
   */
  errores: ErroresCampo;
  /** Edita los campos de la unidad. */
  onEditar: (campos: Partial<CamposUnidad>) => void;
}

/** Reemplaza el elemento `i` de una lista de strings sin mutar el original. */
function reemplazar(lista: string[], i: number, valor: string): string[] {
  return lista.map((v, idx) => (idx === i ? valor : v));
}

/**
 * Formulario de una unidad. La Cátedra de la Paz es de primera clase: la unidad
 * exige `ejePaz` y `catedraPaz` (al menos una temática y el "cómo"). Cada
 * control tiene `label` asociada; los errores usan `role="alert"` enlazado por
 * `aria-describedby`. Objetivos y temáticas son listas editables.
 */
export function UnidadForm({ unidad, errores, onEditar }: UnidadFormProps) {
  const base = useId();
  const idTitulo = `${base}-titulo`;
  const idDescripcion = `${base}-descripcion`;
  const idOrden = `${base}-orden`;
  const idComo = `${base}-como`;
  const idTematicas = `${base}-tematicas`;
  const idPazAyuda = `${base}-paz-ayuda`;

  const errTitulo = errores.titulo;
  const errDescripcion = errores.descripcion;
  const errOrden = errores.orden;
  const errComo = errores['catedraPaz.como'];
  // El error de `tematicas` puede llegar como la lista completa o un índice.
  const errTematicas = errores['catedraPaz.tematicas'] ?? errores['catedraPaz.tematicas.0'];

  const objetivos = unidad.objetivos;
  const tematicas = unidad.catedraPaz.tematicas;

  const setCatedraPaz = (campos: Partial<Unidad['catedraPaz']>) =>
    onEditar({ catedraPaz: { ...unidad.catedraPaz, ...campos } });

  return (
    <Card title="Unidad" headingLevel={3} className="bc-editor">
      <div className="bc-editor__form">
        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idTitulo}>
            Título de la unidad
          </label>
          <input
            id={idTitulo}
            className="bc-editor__input"
            type="text"
            value={unidad.titulo}
            aria-invalid={errTitulo ? true : undefined}
            aria-describedby={errTitulo ? `${idTitulo}-error` : undefined}
            onChange={(e) => onEditar({ titulo: e.target.value })}
          />
          <CampoError id={`${idTitulo}-error`} mensaje={errTitulo} />
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idDescripcion}>
            Descripción
          </label>
          <textarea
            id={idDescripcion}
            className="bc-editor__textarea"
            value={unidad.descripcion}
            aria-invalid={errDescripcion ? true : undefined}
            aria-describedby={errDescripcion ? `${idDescripcion}-error` : undefined}
            onChange={(e) => onEditar({ descripcion: e.target.value })}
          />
          <CampoError id={`${idDescripcion}-error`} mensaje={errDescripcion} />
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idOrden}>
            Orden
          </label>
          <input
            id={idOrden}
            className="bc-editor__input"
            type="number"
            inputMode="numeric"
            value={unidad.orden}
            aria-invalid={errOrden ? true : undefined}
            aria-describedby={errOrden ? `${idOrden}-error` : undefined}
            onChange={(e) => onEditar({ orden: e.target.valueAsNumber || 0 })}
          />
          <CampoError id={`${idOrden}-error`} mensaje={errOrden} />
        </div>

        <fieldset className="bc-editor__field">
          <legend className="bc-editor__label">Objetivos de la unidad</legend>
          <ul className="bc-editor__lista">
            {objetivos.map((obj, i) => {
              const idObj = `${base}-obj-${i}`;
              return (
                <li key={i} className="bc-editor__fila">
                  <label className="bc-editor__radio" htmlFor={idObj}>
                    Objetivo {i + 1}
                  </label>
                  <input
                    id={idObj}
                    className="bc-editor__input"
                    type="text"
                    value={obj}
                    onChange={(e) => onEditar({ objetivos: reemplazar(objetivos, i, e.target.value) })}
                  />
                  <Button
                    variant="ghost"
                    aria-label={`Quitar objetivo ${i + 1}`}
                    onClick={() => onEditar({ objetivos: objetivos.filter((_, idx) => idx !== i) })}
                  >
                    Quitar
                  </Button>
                </li>
              );
            })}
          </ul>
          <Button variant="secondary" onClick={() => onEditar({ objetivos: [...objetivos, ''] })}>
            Añadir objetivo
          </Button>
        </fieldset>

        <p id={idPazAyuda} className="bc-editor__paz">
          <span aria-hidden="true" className="bc-editor__paz-icono">
            ☮
          </span>
          <span>
            La Cátedra de la Paz es el eje transversal de Bacatá: toda unidad declara cómo la
            aborda. Marca el eje y describe al menos una temática.
          </span>
        </p>

        <div className="bc-editor__field">
          <label className="bc-editor__check">
            <input
              type="checkbox"
              className="bc-editor__checkbox"
              checked={unidad.ejePaz}
              aria-describedby={idPazAyuda}
              onChange={(e) => onEditar({ ejePaz: e.target.checked })}
            />
            <span>Esta unidad trabaja la Cátedra de la Paz como eje transversal</span>
          </label>
        </div>

        <fieldset className="bc-editor__field">
          <legend className="bc-editor__label">Temáticas de la Cátedra de la Paz</legend>
          <ul className="bc-editor__lista" aria-describedby={errTematicas ? `${idTematicas}-error` : undefined}>
            {tematicas.map((tema, i) => {
              const idTema = `${base}-tema-${i}`;
              return (
                <li key={i} className="bc-editor__fila">
                  <label className="bc-editor__radio" htmlFor={idTema}>
                    Temática {i + 1}
                  </label>
                  <input
                    id={idTema}
                    className="bc-editor__input"
                    type="text"
                    value={tema}
                    onChange={(e) => setCatedraPaz({ tematicas: reemplazar(tematicas, i, e.target.value) })}
                  />
                  <Button
                    variant="ghost"
                    aria-label={`Quitar temática ${i + 1}`}
                    onClick={() => setCatedraPaz({ tematicas: tematicas.filter((_, idx) => idx !== i) })}
                  >
                    Quitar
                  </Button>
                </li>
              );
            })}
          </ul>
          <CampoError id={`${idTematicas}-error`} mensaje={errTematicas} />
          <Button variant="secondary" onClick={() => setCatedraPaz({ tematicas: [...tematicas, ''] })}>
            Añadir temática
          </Button>
        </fieldset>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idComo}>
            ¿Cómo aborda la unidad la Cátedra de la Paz?
          </label>
          <textarea
            id={idComo}
            className="bc-editor__textarea"
            value={unidad.catedraPaz.como}
            aria-invalid={errComo ? true : undefined}
            aria-describedby={errComo ? `${idComo}-error` : undefined}
            onChange={(e) => setCatedraPaz({ como: e.target.value })}
          />
          <CampoError id={`${idComo}-error`} mensaje={errComo} />
        </div>
      </div>
    </Card>
  );
}
