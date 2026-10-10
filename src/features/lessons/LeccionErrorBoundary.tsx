import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card } from '../../components';
import { Mascota } from '../mascota';
import './lessons.css';

export interface LeccionErrorBoundaryProps {
  /** Volver a la ruta de aprendizaje (reinicia el estado de error). */
  onVolver: () => void;
  children: ReactNode;
}

interface LeccionErrorBoundaryState {
  hayError: boolean;
}

/**
 * Red de seguridad del flujo de lección (y repaso). Si cualquier hijo lanza una
 * excepción durante el render, en vez de dejar una PANTALLA EN BLANCO muestra un
 * mensaje accesible y amable con tono Bacatá y un botón para volver a la ruta.
 *
 * No oculta bugs: en desarrollo registra una traza técnica en consola para
 * depurar. Privacidad (Ley 1581): el log es solo técnico (mensaje y componentes),
 * NUNCA datos del estudiante ni secretos.
 *
 * Accesibilidad: el aviso se anuncia por lector de pantalla (`role="alert"` +
 * `aria-live="assertive"`), el estado se transmite por ícono + texto (no solo
 * color) y el botón es alcanzable por teclado y ≥44px (vía `Button`).
 */
export class LeccionErrorBoundary extends Component<
  LeccionErrorBoundaryProps,
  LeccionErrorBoundaryState
> {
  state: LeccionErrorBoundaryState = { hayError: false };

  static getDerivedStateFromError(): LeccionErrorBoundaryState {
    return { hayError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Solo en desarrollo y solo traza técnica (sin datos del estudiante).
    if (import.meta.env.DEV) {
      console.error('[leccion] Error de render capturado por el boundary:', error, info);
    }
  }

  private volver = (): void => {
    this.setState({ hayError: false });
    this.props.onVolver();
  };

  render(): ReactNode {
    if (!this.state.hayError) {
      return this.props.children;
    }

    return (
      <main className="bc-ruta">
        <Card className="bc-leccion-error">
          <div className="bc-leccion-error__cuerpo">
            <Mascota
              pose="pensando"
              size="sm"
              message="Uy, se nos cruzó un cable. Ya volvemos."
            />
            <div>
              <h1 className="bc-leccion-error__titulo">Se nos cruzó un cable</h1>
              {/* role="alert" + aria-live: lo anuncia el lector de pantalla. */}
              <p role="alert" aria-live="assertive">
                Tuvimos un problema al mostrar este ejercicio. Vuelve a la ruta e
                inténtalo de nuevo; tu progreso quedó guardado.
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={this.volver}>
            Volver a la ruta
          </Button>
        </Card>
      </main>
    );
  }
}
