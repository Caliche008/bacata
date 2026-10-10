import { useStoragePersistence } from './useStoragePersistence';
import '../components/components.css';

/**
 * Ícono de almacenamiento inline, decorativo (`aria-hidden`). El significado va
 * en el texto, no solo en el ícono/color.
 */
function StorageIcon() {
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
      <path d="M4 7c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Z" />
      <path d="M4 7v10c0 1.1 3.6 2 8 2s8-.9 8-2V7" />
      <path d="M4 12c0 1.1 3.6 2 8 2s8-.9 8-2" />
    </svg>
  );
}

/**
 * Aviso de almacenamiento/cuota accesible (R5.6).
 *
 * Solo aparece cuando queda poco espacio o el navegador denegó la persistencia.
 * Si la Storage API no está disponible, no muestra nada ruidoso (no se puede
 * evaluar). Usa `role="status"` + `aria-live="polite"` (informativo, no una
 * alarma), ícono + texto (no solo color) y tono de marca que no asusta.
 */
export function StoragePersistenceNotice() {
  const { lowSpace, apiUnavailable, checking } = useStoragePersistence();

  if (checking || apiUnavailable || !lowSpace) {
    return null;
  }

  return (
    <div className="bc-storage-notice" role="status" aria-live="polite">
      <StorageIcon />
      <p className="bc-connection__text">
        Tu dispositivo tiene poco espacio. Libera un poco para seguir guardando
        tu avance sin problemas.
      </p>
    </div>
  );
}
