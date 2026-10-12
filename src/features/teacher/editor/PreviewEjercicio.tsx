import { useMemo } from 'react';
import { Card } from '../../../components';
import { ejercicioSchema } from '../../../content';
import type { Ejercicio } from '../../../content/types';
import { respuestaInicial } from '../../lessons/answers';
import { ExerciseRenderer } from '../../lessons/exercises/ExerciseRenderer';
import './editor.css';

export interface PreviewEjercicioProps {
  ejercicio: Ejercicio;
}

/**
 * Previsualiza un ejercicio tal como lo vería el estudiante, REUTILIZANDO el
 * `ExerciseRenderer` del flujo del estudiante (no se duplica ningún
 * renderizador). Se monta con `respuestaInicial(ejercicio)` y
 * `deshabilitado=true`: es solo una vista previa, el docente no responde aquí.
 *
 * Si el ejercicio aún no valida contra `ejercicioSchema` (borrador incompleto),
 * se muestra un aviso accesible (`role="status"`) en lugar de intentar
 * renderizarlo y romper. Así la previsualización nunca lanza frente al docente.
 */
export function PreviewEjercicio({ ejercicio }: PreviewEjercicioProps) {
  const resultado = useMemo(() => ejercicioSchema.safeParse(ejercicio), [ejercicio]);

  return (
    <Card title="Previsualización" headingLevel={3} className="bc-editor">
      <p className="bc-editor__ayuda">
        Así se verá este ejercicio para el estudiante. La vista previa está deshabilitada: es
        solo para revisar.
      </p>
      {resultado.success ? (
        <div className="bc-editor__preview" aria-label="Vista previa del ejercicio">
          <ExerciseRenderer
            ejercicio={resultado.data}
            respuesta={respuestaInicial(resultado.data)}
            onChange={() => {}}
            deshabilitado={true}
          />
        </div>
      ) : (
        <p role="status" className="bc-editor__aviso">
          <span aria-hidden="true" className="bc-editor__aviso-icono">
            ℹ
          </span>
          <span>
            Aún no podemos previsualizar: completa el ejercicio para verlo como lo vería el
            estudiante.
          </span>
        </p>
      )}
    </Card>
  );
}
