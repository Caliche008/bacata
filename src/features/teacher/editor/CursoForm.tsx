import { useId } from 'react';
import { Card } from '../../../components';
import { GRADOS_SOPORTADOS } from '../../../content';
import type { Curso, Grado } from '../../../content/types';
import { CampoError } from './CampoError';
import type { CamposCurso } from './useEditorContenido';
import type { ErroresCampo } from './validation';
import './editor.css';

export interface CursoFormProps {
  curso: Curso;
  /** Errores por campo del curso (ruta -> mensaje) de la validación en vivo. */
  errores: ErroresCampo;
  /** Cambia el grado del curso. */
  onCambiarGrado: (grado: Grado) => void;
  /** Edita los campos de cabecera del curso (título, descripción, versión). */
  onEditar: (campos: Partial<CamposCurso>) => void;
}

/**
 * Formulario de la cabecera del curso: grado (radiogroup con
 * `GRADOS_SOPORTADOS`), título, descripción y versión. Cada control tiene su
 * `label` asociada (`htmlFor`/`id`) y, cuando hay error, lo anuncia con
 * `role="alert"` enlazado por `aria-describedby`.
 */
export function CursoForm({ curso, errores, onCambiarGrado, onEditar }: CursoFormProps) {
  const base = useId();
  const idTitulo = `${base}-titulo`;
  const idDescripcion = `${base}-descripcion`;
  const idVersion = `${base}-version`;

  const errTitulo = errores.titulo;
  const errDescripcion = errores.descripcion;
  const errVersion = errores.version;

  return (
    <Card title="Datos del curso" className="bc-editor">
      <div className="bc-editor__form">
        <fieldset className="bc-editor__field">
          <legend className="bc-editor__label">Grado</legend>
          <div className="bc-editor__grados" role="radiogroup" aria-label="Grado del curso">
            {GRADOS_SOPORTADOS.map((valor) => {
              const checked = curso.grado === valor;
              return (
                <label
                  key={valor}
                  className={`bc-editor__grado${checked ? ' bc-editor__grado--activo' : ''}`}
                >
                  <input
                    type="radio"
                    name={`${base}-grado`}
                    className="bc-editor__radio"
                    value={valor}
                    checked={checked}
                    onChange={() => onCambiarGrado(valor)}
                  />
                  <span>{valor}°</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idTitulo}>
            Título del curso
          </label>
          <input
            id={idTitulo}
            className="bc-editor__input"
            type="text"
            value={curso.titulo}
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
            value={curso.descripcion}
            aria-invalid={errDescripcion ? true : undefined}
            aria-describedby={errDescripcion ? `${idDescripcion}-error` : undefined}
            onChange={(e) => onEditar({ descripcion: e.target.value })}
          />
          <CampoError id={`${idDescripcion}-error`} mensaje={errDescripcion} />
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idVersion}>
            Versión del contenido
          </label>
          <input
            id={idVersion}
            className="bc-editor__input"
            type="text"
            value={curso.version}
            aria-invalid={errVersion ? true : undefined}
            aria-describedby={errVersion ? `${idVersion}-error` : undefined}
            onChange={(e) => onEditar({ version: e.target.value })}
          />
          <CampoError id={`${idVersion}-error`} mensaje={errVersion} />
        </div>
      </div>
    </Card>
  );
}
