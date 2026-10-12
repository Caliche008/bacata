import { useId } from 'react';
import { Card } from '../../../components';
import type { Ejercicio, Meta } from '../../../content/types';
import { CampoError } from './CampoError';
import { MetaForm } from './MetaForm';
import { AnalisisFuenteFields } from './tipos/AnalisisFuenteFields';
import { CompletarFields } from './tipos/CompletarFields';
import { DilemaFields } from './tipos/DilemaFields';
import { EmparejarFields } from './tipos/EmparejarFields';
import { OpcionMultipleFields } from './tipos/OpcionMultipleFields';
import { OrdenarFields } from './tipos/OrdenarFields';
import { VerdaderoFalsoFields } from './tipos/VerdaderoFalsoFields';
import type { ErroresCampo } from './validation';
import './editor.css';

/** Tipos de ejercicio y su etiqueta visible (en el orden del esquema). */
const TIPOS: { valor: Ejercicio['tipo']; etiqueta: string }[] = [
  { valor: 'opcion_multiple', etiqueta: 'Opción múltiple' },
  { valor: 'verdadero_falso', etiqueta: 'Verdadero / Falso' },
  { valor: 'emparejar', etiqueta: 'Emparejar' },
  { valor: 'ordenar', etiqueta: 'Ordenar' },
  { valor: 'completar', etiqueta: 'Completar' },
  { valor: 'dilema', etiqueta: 'Dilema' },
  { valor: 'analisis_fuente', etiqueta: 'Análisis de fuente' },
];

export interface EjercicioFormProps {
  ejercicio: Ejercicio;
  /** Errores por campo del ejercicio (ruta -> mensaje) de la validación en vivo. */
  errores: ErroresCampo;
  /** Devuelve el ejercicio completo actualizado (incluye cambios de tipo). */
  onChange: (ejercicio: Ejercicio) => void;
}

/**
 * Construye un ejercicio del `tipo` indicado conservando los campos comunes
 * (`id`, `enunciado`, `retroalimentacion`, `meta`) y reiniciando los campos
 * propios del tipo. Al cambiar de tipo NO se arrastran campos de otro tipo, de
 * modo que el objeto respeta el `.strict()` del esquema.
 */
function construirPorTipo(tipo: Ejercicio['tipo'], base: Ejercicio): Ejercicio {
  const comun = {
    id: base.id,
    enunciado: base.enunciado,
    retroalimentacion: base.retroalimentacion,
    meta: base.meta,
  };
  switch (tipo) {
    case 'opcion_multiple':
      return { ...comun, tipo, opciones: [{ id: 'op-1', texto: '', esCorrecta: false }] };
    case 'verdadero_falso':
      return { ...comun, tipo, respuestaCorrecta: true, justificacion: '' };
    case 'emparejar':
      return { ...comun, tipo, pares: [{ izquierda: '', derecha: '' }] };
    case 'ordenar':
      return { ...comun, tipo, elementos: [{ id: 'el-1', texto: '', orden: 1 }] };
    case 'completar':
      return {
        ...comun,
        tipo,
        texto: '',
        huecos: [{ id: 'h-1', opciones: [''], correcta: '' }],
      };
    case 'dilema':
      return {
        ...comun,
        tipo,
        escenario: '',
        opciones: [{ id: 'op-1', texto: '', reflexion: '' }],
      };
    case 'analisis_fuente':
      return {
        ...comun,
        tipo,
        recurso: { clase: 'texto', contenido: '' },
        preguntas: [
          { id: 'pr-1', pregunta: '', opciones: [{ id: 'op-1', texto: '', esCorrecta: false }] },
        ],
      };
    default: {
      const _exhaustivo: never = tipo;
      return _exhaustivo;
    }
  }
}

/**
 * Despacha el sub-formulario del tipo con un `switch` exhaustivo (espejo de
 * `ExerciseRenderer`); el `never` del `default` fuerza, en compilación, cubrir
 * cualquier tipo nuevo. Cada rama fusiona los campos propios del tipo sobre el
 * ejercicio ya tipado por narrowing.
 */
function SubFormulario({
  ejercicio,
  errores,
  onChange,
}: {
  ejercicio: Ejercicio;
  errores: ErroresCampo;
  onChange: (ejercicio: Ejercicio) => void;
}) {
  switch (ejercicio.tipo) {
    case 'opcion_multiple':
      return (
        <OpcionMultipleFields
          ejercicio={ejercicio}
          errores={errores}
          onEditar={(campos) => onChange({ ...ejercicio, ...campos })}
        />
      );
    case 'verdadero_falso':
      return (
        <VerdaderoFalsoFields
          ejercicio={ejercicio}
          errores={errores}
          onEditar={(campos) => onChange({ ...ejercicio, ...campos })}
        />
      );
    case 'emparejar':
      return (
        <EmparejarFields
          ejercicio={ejercicio}
          errores={errores}
          onEditar={(campos) => onChange({ ...ejercicio, ...campos })}
        />
      );
    case 'ordenar':
      return (
        <OrdenarFields
          ejercicio={ejercicio}
          errores={errores}
          onEditar={(campos) => onChange({ ...ejercicio, ...campos })}
        />
      );
    case 'completar':
      return (
        <CompletarFields
          ejercicio={ejercicio}
          errores={errores}
          onEditar={(campos) => onChange({ ...ejercicio, ...campos })}
        />
      );
    case 'dilema':
      return (
        <DilemaFields
          ejercicio={ejercicio}
          errores={errores}
          onEditar={(campos) => onChange({ ...ejercicio, ...campos })}
        />
      );
    case 'analisis_fuente':
      return (
        <AnalisisFuenteFields
          ejercicio={ejercicio}
          errores={errores}
          onEditar={(campos) => onChange({ ...ejercicio, ...campos })}
        />
      );
    default: {
      const _exhaustivo: never = ejercicio;
      return _exhaustivo;
    }
  }
}

/**
 * Editor de un ejercicio: selector de tipo (que al cambiar reinicia los campos
 * propios del tipo), enunciado, retroalimentación del ejercicio y los
 * metadatos (`<MetaForm/>`), más el sub-formulario del tipo elegido. El objeto
 * resultante valida contra `ejercicioSchema`, incluida la regla de
 * retroalimentación formativa (`superRefine`) y los `.strict()`.
 */
export function EjercicioForm({ ejercicio, errores, onChange }: EjercicioFormProps) {
  const base = useId();
  const idEnunciado = `${base}-enunciado`;
  const idRetro = `${base}-retro`;

  const errEnunciado = errores.enunciado;
  const errRetro = errores.retroalimentacion;

  const editarMeta = (campos: Partial<Meta>) =>
    onChange({ ...ejercicio, meta: { ...ejercicio.meta, ...campos } });

  // Errores de la meta, con la ruta recortada (sin el prefijo `meta.`).
  const erroresMeta: ErroresCampo = {};
  for (const [ruta, mensaje] of Object.entries(errores)) {
    if (ruta.startsWith('meta.')) {
      erroresMeta[ruta.slice('meta.'.length)] = mensaje;
    }
  }

  return (
    <Card title="Ejercicio" headingLevel={3} className="bc-editor">
      <div className="bc-editor__form">
        <fieldset className="bc-editor__field">
          <legend className="bc-editor__label">Tipo de ejercicio</legend>
          <div className="bc-editor__grados" role="radiogroup" aria-label="Tipo de ejercicio">
            {TIPOS.map(({ valor, etiqueta }) => {
              const checked = ejercicio.tipo === valor;
              return (
                <label
                  key={valor}
                  className={`bc-editor__grado${checked ? ' bc-editor__grado--activo' : ''}`}
                >
                  <input
                    type="radio"
                    name={`${base}-tipo`}
                    className="bc-editor__radio"
                    value={valor}
                    checked={checked}
                    onChange={() => onChange(construirPorTipo(valor, ejercicio))}
                  />
                  <span>{etiqueta}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idEnunciado}>
            Enunciado
          </label>
          <textarea
            id={idEnunciado}
            className="bc-editor__textarea"
            value={ejercicio.enunciado}
            aria-invalid={errEnunciado ? true : undefined}
            aria-describedby={errEnunciado ? `${idEnunciado}-error` : undefined}
            onChange={(e) => onChange({ ...ejercicio, enunciado: e.target.value })}
          />
          <CampoError id={`${idEnunciado}-error`} mensaje={errEnunciado} />
        </div>

        <div className="bc-editor__field">
          <label className="bc-editor__label" htmlFor={idRetro}>
            Retroalimentación del ejercicio (opcional)
          </label>
          <textarea
            id={idRetro}
            className="bc-editor__textarea"
            value={ejercicio.retroalimentacion ?? ''}
            aria-invalid={errRetro ? true : undefined}
            aria-describedby={errRetro ? `${idRetro}-error` : undefined}
            onChange={(e) =>
              onChange({
                ...ejercicio,
                retroalimentacion: e.target.value.trim() === '' ? undefined : e.target.value,
              })
            }
          />
          <CampoError id={`${idRetro}-error`} mensaje={errRetro} />
        </div>

        <SubFormulario ejercicio={ejercicio} errores={errores} onChange={onChange} />

        <MetaForm meta={ejercicio.meta} errores={erroresMeta} onEditar={editarMeta} />
      </div>
    </Card>
  );
}
