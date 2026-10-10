import { useState } from 'react';
import { Button, ConfirmDialog, Feedback } from '../../components';
import { deleteStudentData } from '../../lib/storage';
import { useSession } from '../auth';
import './privacy.css';

/**
 * Borrado de datos del propio estudiante desde la UI (R8.3, derecho de
 * supresión — Ley 1581). Reutiliza `deleteStudentData` de `lib/storage` (NO
 * reimplementa el borrado) y el `ConfirmDialog` accesible para confirmar la
 * acción destructiva.
 *
 * Al confirmar: borra perfil + progreso de este dispositivo y cierra la sesión
 * para volver al acceso del estudiante. Si el borrado falla, muestra un error
 * accesible (`Feedback`, role=status) sin registrar datos sensibles en logs.
 *
 * Sin sesión activa no renderiza nada: solo tiene sentido para un estudiante
 * con perfil cargado.
 */
export function BorrarMisDatos() {
  const { perfil, cerrarSesion } = useSession();
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!perfil) {
    return null;
  }

  const confirmar = () => {
    setConfirmando(false);
    setError(null);
    setBorrando(true);
    void (async () => {
      try {
        await deleteStudentData(perfil.id);
        // Vuelve al acceso del estudiante; la sesión ya no tiene datos.
        cerrarSesion();
      } catch {
        // No registramos el error en consola: podría arrastrar datos del
        // perfil. Se informa de forma accesible y se permite reintentar.
        setBorrando(false);
        setError(
          'No pudimos borrar tus datos en este momento. Inténtalo de nuevo.',
        );
      }
    })();
  };

  return (
    <section className="bc-borrar" aria-label="Borrar mis datos">
      <h2 className="bc-borrar__titulo">Borrar mis datos</h2>
      <p className="bc-borrar__texto">
        Puedes eliminar tu perfil y tu progreso de este dispositivo cuando
        quieras. Esta acción no se puede deshacer.
      </p>

      {error ? <Feedback state="incorrecto" message={error} /> : null}

      <div>
        <Button
          variant="secondary"
          onClick={() => setConfirmando(true)}
          disabled={borrando}
        >
          {borrando ? 'Borrando…' : 'Borrar mis datos'}
        </Button>
      </div>

      {confirmando ? (
        <ConfirmDialog
          titulo="Borrar mis datos"
          mensaje="Se borrarán tu perfil y tu progreso en este dispositivo. Esta acción no se puede deshacer."
          etiquetaConfirmar="Borrar"
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      ) : null}
    </section>
  );
}
