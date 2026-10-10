import { Button, Card } from '../../components';
import { Mascota } from '../mascota';
import { useOnlineStatus } from '../../app/useOnlineStatus';
import './lessons.css';

export interface ContenidoNoDisponibleProps {
  /** Volver a la ruta de aprendizaje. */
  onVolver: () => void;
}

/**
 * Aviso de contenido no disponible (R5.7).
 *
 * Alcance MVP: el contenido pedagógico viaja EMPAQUETADO con la app (ver
 * `src/content/loader.ts`), así que normalmente está disponible offline. Este
 * aviso cubre el caso límite en el que se solicita una lección que no está en el
 * paquete (p. ej. un contenido que solo existirá tras una actualización):
 * explica, con ícono + texto y tono de marca, qué falta y cómo obtenerlo. El
 * mensaje se adapta a si hay conexión o no.
 *
 * En Fase 2 (con descarga/sincronización) este mismo punto cubrirá el caso de
 * contenido aún no descargado.
 */
export function ContenidoNoDisponible({ onVolver }: ContenidoNoDisponibleProps) {
  const online = useOnlineStatus();

  const mensaje = online
    ? 'Esta lección todavía no está disponible en tu dispositivo. Puede llegar en una próxima actualización de la app.'
    : 'Esta lección no está disponible sin conexión. Conéctate una vez para terminar de instalarla y luego podrás usarla sin internet.';

  return (
    <main className="bc-ruta">
      <Card className="bc-contenido-no-disponible">
        <div className="bc-contenido-no-disponible__cuerpo">
          <Mascota
            pose="pensando"
            size="sm"
            message="Esta parte todavía no está lista aquí."
          />
          <div>
            <h1 className="bc-contenido-no-disponible__titulo">
              Contenido no disponible
            </h1>
            {/* role="status" + aria-live: lo anuncia el lector de pantalla. */}
            <p role="status" aria-live="polite">
              {mensaje}
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={onVolver}>
          Volver a mi ruta
        </Button>
      </Card>
    </main>
  );
}
