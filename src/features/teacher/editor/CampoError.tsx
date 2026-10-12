import './editor.css';

export interface CampoErrorProps {
  /** Id del nodo del error, enlazado desde `aria-describedby` del control. */
  id: string;
  /** Mensaje a mostrar; si está vacío, no se renderiza nada. */
  mensaje?: string;
}

/**
 * Mensaje de error de un campo, accesible: `role="alert"` para que el lector de
 * pantalla lo anuncie, e icono + texto para no depender solo del color (WCAG).
 * El `id` permite enlazarlo con `aria-describedby` desde el control asociado.
 */
export function CampoError({ id, mensaje }: CampoErrorProps) {
  if (!mensaje) {
    return null;
  }
  return (
    <p id={id} role="alert" className="bc-editor__error">
      <span aria-hidden="true" className="bc-editor__error-icono">
        ⚠
      </span>
      <span>{mensaje}</span>
    </p>
  );
}
