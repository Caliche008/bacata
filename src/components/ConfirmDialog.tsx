import { useEffect, useId, useRef } from 'react';
import './components.css';

export interface ConfirmDialogProps {
  titulo: string;
  mensaje: string;
  etiquetaConfirmar: string;
  etiquetaCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Diálogo de confirmación accesible para acciones destructivas o sensibles
 * (R6.6, R6.7, R8.3). `role="dialog"` + `aria-modal`, foco inicial en
 * "Cancelar" (opción segura), cierre con Escape, y un trap de foco simple entre
 * los dos botones. El mensaje se asocia por `aria-describedby`.
 *
 * Componente base reutilizable: lo usan tanto el panel docente (eliminar
 * perfil/clase) como el borrado de datos del propio estudiante (features/privacy).
 *
 * Usa <button> nativos (con las clases de `Button`) porque el diálogo necesita
 * refs para gestionar el foco y `Button` no reenvía ref.
 */
export function ConfirmDialog({
  titulo,
  mensaje,
  etiquetaConfirmar,
  etiquetaCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const tituloId = useId();
  const mensajeId = useId();
  const dialogoRef = useRef<HTMLDivElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const confirmarRef = useRef<HTMLButtonElement>(null);

  // Patrón de `CelebracionUnidad`/`PanelProgreso`: el foco inicial va a la
  // opción segura y el teclado (Escape + trap de Tab) se maneja con
  // `addEventListener` sobre el ref, no con un `onKeyDown` en JSX.
  useEffect(() => {
    cancelarRef.current?.focus();

    const dialogo = dialogoRef.current;
    const onKeyDown = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        onCancelar();
        return;
      }
      if (evento.key === 'Tab') {
        const activo = document.activeElement;
        if (evento.shiftKey && activo === cancelarRef.current) {
          evento.preventDefault();
          confirmarRef.current?.focus();
        } else if (!evento.shiftKey && activo === confirmarRef.current) {
          evento.preventDefault();
          cancelarRef.current?.focus();
        }
      }
    };

    dialogo?.addEventListener('keydown', onKeyDown);
    return () => dialogo?.removeEventListener('keydown', onKeyDown);
  }, [onCancelar]);

  return (
    <div className="bc-dialog__overlay">
      <div
        ref={dialogoRef}
        className="bc-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={mensajeId}
      >
        <h3 id={tituloId} className="bc-dialog__titulo">
          {titulo}
        </h3>
        <p id={mensajeId}>{mensaje}</p>
        <div className="bc-dialog__acciones">
          <button
            ref={cancelarRef}
            type="button"
            className="bc-button bc-button--ghost"
            onClick={onCancelar}
          >
            {etiquetaCancelar}
          </button>
          <button
            ref={confirmarRef}
            type="button"
            className="bc-button bc-button--primary"
            onClick={onConfirmar}
          >
            {etiquetaConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
