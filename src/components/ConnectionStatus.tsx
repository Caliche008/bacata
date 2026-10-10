import { useOnlineStatus } from '../app/useOnlineStatus';
import './components.css';

/**
 * Ícono de "sin conexión" inline, decorativo (`aria-hidden`). El significado
 * SIEMPRE viaja en el texto, nunca solo en el ícono ni en el color.
 */
function OfflineIcon() {
  return (
    <svg
      className="bc-connection__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M8.5 8.9A7 7 0 0 1 12 8c2 0 3.8.8 5.1 2.1" />
      <path d="M5 11.5A11 11 0 0 1 8 9.6" />
      <path d="M12 16h.01" />
    </svg>
  );
}

/**
 * Indicador de conexión accesible (R5.7).
 *
 * Solo aparece cuando el estudiante está SIN conexión: muestra un aviso compacto
 * con ícono + texto (no solo color), `role="status"` + `aria-live="polite"` para
 * que el lector de pantalla lo anuncie sin robar el foco, y microcopy con tono de
 * marca que tranquiliza (el progreso se guarda localmente). Con conexión no
 * renderiza nada.
 */
export function ConnectionStatus() {
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div className="bc-connection" role="status" aria-live="polite">
      <OfflineIcon />
      <p className="bc-connection__text">
        Estás sin conexión. Puedes seguir aprendiendo; tu progreso se guarda en
        este dispositivo.
      </p>
    </div>
  );
}
