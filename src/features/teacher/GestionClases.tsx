import { useId, useState, type FormEvent } from 'react';
import { Button, Card, ConfirmDialog, Feedback } from '../../components';
import type { ClaseLocal } from '../../lib/storage';
import type { Grado } from '../../content/types';
import './teacher.css';

export interface GestionClasesProps {
  clases: ClaseLocal[];
  claseSeleccionada: ClaseLocal | null;
  onSeleccionar: (claseId: string) => void;
  onCrear: (grado: Grado, idsUnidadesActivas: string[]) => Promise<void>;
  onRegenerar: (claseId: string) => Promise<void>;
}

type Confirmacion = { claseId: string; codigo: string } | null;

/**
 * Lista y creación de clases (R6.1, R6.7). El código es visible para
 * compartirlo. Crear una clase elige el grado con un `radiogroup` operable por
 * teclado. "Regenerar código" y "Desactivar código" piden confirmación
 * accesible y avisan del efecto en estudiantes ya registrados.
 *
 * "Desactivar código" se implementa como regenerarlo: el código anterior deja
 * de servir. Los estudiantes ya registrados conservan su progreso, pero no
 * podrán reentrar con el código viejo.
 */
export function GestionClases({
  clases,
  claseSeleccionada,
  onSeleccionar,
  onCrear,
  onRegenerar,
}: GestionClasesProps) {
  const [grado, setGrado] = useState<Grado>(6);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<Confirmacion>(null);

  const gradoLabelId = useId();

  const handleCrear = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setCreando(true);
    void (async () => {
      try {
        // Lista vacía = sin unidades ocultas (se muestran todas por defecto).
        await onCrear(grado, []);
      } catch {
        setError('No pudimos crear la clase. Inténtalo de nuevo.');
      } finally {
        setCreando(false);
      }
    })();
  };

  const confirmarRegenerar = () => {
    if (!confirmar) {
      return;
    }
    const { claseId } = confirmar;
    setConfirmar(null);
    void onRegenerar(claseId);
  };

  return (
    <section className="bc-teacher__section" aria-label="Gestión de clases">
      <Card title="Crear una clase" headingLevel={3}>
        <form className="bc-teacher__form" onSubmit={handleCrear} noValidate>
          <fieldset className="bc-teacher__field">
            <legend id={gradoLabelId} className="bc-teacher__label">
              Grado de la clase
            </legend>
            <div
              className="bc-teacher__grados"
              role="radiogroup"
              aria-labelledby={gradoLabelId}
            >
              {([6, 7] as const).map((valor) => {
                const checked = grado === valor;
                return (
                  <label
                    key={valor}
                    className={`bc-teacher__grado${
                      checked ? ' bc-teacher__grado--activo' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="grado-clase"
                      className="bc-teacher__radio"
                      value={valor}
                      checked={checked}
                      disabled={creando}
                      onChange={() => setGrado(valor)}
                    />
                    <span>{valor}°</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error ? <Feedback state="incorrecto" message={error} /> : null}

          <Button type="submit" variant="primary" disabled={creando}>
            {creando ? 'Creando…' : 'Crear clase'}
          </Button>
        </form>
      </Card>

      <Card title="Tus clases" headingLevel={3}>
        {clases.length === 0 ? (
          <p className="bc-teacher__vacio">
            Aún no tienes clases. Crea una para obtener un código y compartirlo con tus
            estudiantes.
          </p>
        ) : (
          <ul className="bc-teacher__list">
            {clases.map((clase) => {
              const activa = claseSeleccionada?.id === clase.id;
              return (
                <li key={clase.id} className="bc-teacher__item">
                  <span>
                    <span className="bc-teacher__code">{clase.codigo}</span>
                    {activa ? ' · seleccionada' : null}
                  </span>
                  <span className="bc-teacher__acciones">
                    {!activa ? (
                      <Button variant="ghost" onClick={() => onSeleccionar(clase.id)}>
                        Seleccionar
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setConfirmar({ claseId: clase.id, codigo: clase.codigo })
                      }
                    >
                      Regenerar código
                    </Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {confirmar ? (
        <ConfirmDialog
          titulo="Regenerar el código"
          mensaje={`El código ${confirmar.codigo} dejará de servir. Los estudiantes ya registrados conservan su progreso, pero deberás compartir el nuevo código para que vuelvan a entrar.`}
          etiquetaConfirmar="Regenerar"
          onConfirmar={confirmarRegenerar}
          onCancelar={() => setConfirmar(null)}
        />
      ) : null}
    </section>
  );
}
