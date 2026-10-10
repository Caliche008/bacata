import { useId, useState, type FormEvent } from 'react';
import { Button, Card, ConfirmDialog, Feedback } from '../../components';
import type { ResumenEstudiante } from './progress-service';
import './teacher.css';

export interface GestionEstudiantesProps {
  estudiantes: Pick<ResumenEstudiante, 'estudianteId' | 'apodo'>[];
  onRenombrar: (
    estudianteId: string,
    nuevoApodo: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  onEliminar: (estudianteId: string) => Promise<void>;
}

type Edicion = { id: string; apodo: string } | null;
type Borrado = { id: string; apodo: string } | null;

/**
 * Gestión de perfiles de estudiante (R6.6): renombrar el apodo o eliminar el
 * perfil (supresión completa — Ley 1581). El borrado pide confirmación
 * accesible (`ConfirmDialog`: role=dialog, aria-modal, foco atrapado) antes de
 * la acción destructiva. Solo se maneja apodo + id interno, nunca PII.
 */
export function GestionEstudiantes({
  estudiantes,
  onRenombrar,
  onEliminar,
}: GestionEstudiantesProps) {
  const [edicion, setEdicion] = useState<Edicion>(null);
  const [error, setError] = useState<string | null>(null);
  const [borrado, setBorrado] = useState<Borrado>(null);

  const inputId = useId();
  const errorId = useId();

  const abrirEdicion = (id: string, apodo: string) => {
    setError(null);
    setEdicion({ id, apodo });
  };

  const guardar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!edicion) {
      return;
    }
    setError(null);
    void (async () => {
      const resultado = await onRenombrar(edicion.id, edicion.apodo);
      if (resultado.ok) {
        setEdicion(null);
      } else {
        setError(resultado.error ?? 'No pudimos cambiar el apodo.');
      }
    })();
  };

  const confirmarBorrado = () => {
    if (!borrado) {
      return;
    }
    const { id } = borrado;
    setBorrado(null);
    void onEliminar(id);
  };

  return (
    <section className="bc-teacher__section" aria-label="Gestión de estudiantes">
      {estudiantes.length === 0 ? (
        <p className="bc-teacher__vacio">
          No hay estudiantes para gestionar en esta clase.
        </p>
      ) : (
        <ul className="bc-teacher__list">
          {estudiantes.map((estudiante) => {
            const editando = edicion?.id === estudiante.estudianteId;
            return (
              <li key={estudiante.estudianteId}>
                <Card headingLevel={3} as="article" title={estudiante.apodo}>
                  {editando ? (
                    <form className="bc-teacher__form" onSubmit={guardar} noValidate>
                      <div className="bc-teacher__field">
                        <label htmlFor={inputId} className="bc-teacher__label">
                          Nuevo apodo
                        </label>
                        <input
                          id={inputId}
                          className="bc-teacher__input"
                          type="text"
                          autoComplete="off"
                          maxLength={20}
                          value={edicion.apodo}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? errorId : undefined}
                          onChange={(e) =>
                            setEdicion({ id: estudiante.estudianteId, apodo: e.target.value })
                          }
                        />
                        {error ? (
                          <div id={errorId}>
                            <Feedback state="incorrecto" message={error} />
                          </div>
                        ) : null}
                      </div>
                      <span className="bc-teacher__acciones">
                        <Button type="submit" variant="primary">
                          Guardar apodo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEdicion(null);
                            setError(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </span>
                    </form>
                  ) : (
                    <span className="bc-teacher__acciones">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          abrirEdicion(estudiante.estudianteId, estudiante.apodo)
                        }
                      >
                        Renombrar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setBorrado({ id: estudiante.estudianteId, apodo: estudiante.apodo })
                        }
                      >
                        Eliminar perfil
                      </Button>
                    </span>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {borrado ? (
        <ConfirmDialog
          titulo="Eliminar perfil"
          mensaje={`Se borrarán por completo el perfil y el progreso de "${borrado.apodo}". Esta acción no se puede deshacer.`}
          etiquetaConfirmar="Eliminar"
          onConfirmar={confirmarBorrado}
          onCancelar={() => setBorrado(null)}
        />
      ) : null}
    </section>
  );
}
