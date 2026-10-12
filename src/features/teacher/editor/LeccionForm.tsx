import { useId } from 'react';
import { Card } from '../../../components';
import type { Leccion } from '../../../content/types';
import { CampoError } from './CampoError';
import type { CamposLeccion } from './useEditorContenido';
import type { ErroresCampo } from './validation';
import './editor.css';

export interface LeccionFormProps {
  leccion: Leccion;
  /** Errores por campo de la lección (ruta -> mensaje) de la validación en vivo. */
  errores: ErroresCampo;
  /** Edita los campos de la lección. */
  onEditar: (campos: Partial<CamposLeccion>) => void;
}

/**
 * Formulario de una lección: título, objetivo de aprendizaje, competencia y
 * orden. Cada control tiene su `label` asociada (`htmlFor`/`id`); los errores
 * se anuncian con `role="alert"` enlazado por `aria-describedby`.
 */
export function LeccionForm({ leccion, errores, onEditar }: LeccionFormProps) {
  const base = useId();
  const idTitulo = `${base}-titulo`;
  const idObjetivo = `${base}-objetivo`;
  const idCompetencia = `${base}-competencia`;
  const idOrden = `${base}-orden`;

  const errTitulo = errores.titulo;
  const errObjetivo = errores.objetivoAprendizaje;
  const errCompetencia = errores.competencia;
  const errOrden = errores.orden;

  return (
    <Card title="Lección" headingLevel={4} className="bc-editor">
      <div className="bc-editor__form">
        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idTitulo}>
            Título de la lección
          </label>
          <input
            id={idTitulo}
            className="bc-editor__input"
            type="text"
            value={leccion.titulo}
            aria-invalid={errTitulo ? true : undefined}
            aria-describedby={errTitulo ? `${idTitulo}-error` : undefined}
            onChange={(e) => onEditar({ titulo: e.target.value })}
          />
          <CampoError id={`${idTitulo}-error`} mensaje={errTitulo} />
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idObjetivo}>
            Objetivo de aprendizaje
          </label>
          <textarea
            id={idObjetivo}
            className="bc-editor__textarea"
            value={leccion.objetivoAprendizaje}
            aria-invalid={errObjetivo ? true : undefined}
            aria-describedby={errObjetivo ? `${idObjetivo}-error` : undefined}
            onChange={(e) => onEditar({ objetivoAprendizaje: e.target.value })}
          />
          <CampoError id={`${idObjetivo}-error`} mensaje={errObjetivo} />
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idCompetencia}>
            Competencia
          </label>
          <input
            id={idCompetencia}
            className="bc-editor__input"
            type="text"
            value={leccion.competencia}
            aria-invalid={errCompetencia ? true : undefined}
            aria-describedby={errCompetencia ? `${idCompetencia}-error` : undefined}
            onChange={(e) => onEditar({ competencia: e.target.value })}
          />
          <CampoError id={`${idCompetencia}-error`} mensaje={errCompetencia} />
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
            value={leccion.orden}
            aria-invalid={errOrden ? true : undefined}
            aria-describedby={errOrden ? `${idOrden}-error` : undefined}
            onChange={(e) => onEditar({ orden: e.target.valueAsNumber || 0 })}
          />
          <CampoError id={`${idOrden}-error`} mensaje={errOrden} />
        </div>
      </div>
    </Card>
  );
}
