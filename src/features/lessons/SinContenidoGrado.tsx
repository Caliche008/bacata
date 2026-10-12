import { Button, Card } from '../../components';
import { Mascota } from '../mascota';
import type { Grado } from '../../content';
import './lessons.css';

export interface SinContenidoGradoProps {
  /** Grado elegido por el estudiante, para personalizar el mensaje. */
  grado: Grado;
  /** Volver al acceso para cambiar de perfil/grado. */
  onCambiarPerfil: () => void;
}

/**
 * Estado vacío amable para un grado habilitado que todavía NO tiene contenido
 * empaquetado (hoy 8°–11°). La plataforma soporta 6–11; el contenido llega por
 * fases, así que esto NO es un error: por eso usa `role="status"` (no `alert`),
 * la mascota en pose `pensando` y tono de marca Bacatá.
 *
 * Accesibilidad: el estado se comunica por mascota + texto (no solo color); el
 * mensaje se anuncia por `aria-live="polite"`; la acción es un botón alcanzable
 * por teclado con objetivo táctil del sistema de botones.
 */
export function SinContenidoGrado({ grado, onCambiarPerfil }: SinContenidoGradoProps) {
  return (
    <main className="bc-ruta">
      <Card className="bc-contenido-no-disponible">
        <div className="bc-contenido-no-disponible__cuerpo">
          <Mascota
            pose="pensando"
            size="sm"
            message="Estoy preparando esta parte de la ruta."
          />
          <div>
            <h1 className="bc-contenido-no-disponible__titulo">
              Pronto habrá lecciones para tu grado
            </h1>
            {/* role="status" + aria-live: no es un error, es un aviso amable. */}
            <p role="status" aria-live="polite">
              Estamos preparando el contenido de grado {grado}°. Vuelve muy pronto:
              seguimos sumando lecciones para construir tu ruta.
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={onCambiarPerfil}>
          Cambiar de perfil
        </Button>
      </Card>
    </main>
  );
}
