import type { LeccionVista } from './path';

/**
 * Un ítem de lección en la ruta. El estado se comunica por ÍCONO + TEXTO (nunca
 * solo por color, R9.5/R2.3): candado + "Bloqueada", "Empezar" cuando está
 * disponible, check + "Completada". Una lección bloqueada no es iniciable
 * (`disabled`), así que `onSelect` solo se invoca para disponible/completada.
 * El `<button>` base ya garantiza objetivo táctil ≥ 44px y foco visible.
 */

export interface LeccionItemProps {
  leccion: LeccionVista;
  onSelect: (leccionId: string) => void;
}

interface EstadoUI {
  icono: string;
  etiqueta: string;
  bloqueada: boolean;
}

const ESTADO_UI: Record<LeccionVista['estado'], EstadoUI> = {
  bloqueada: { icono: '🔒', etiqueta: 'Bloqueada', bloqueada: true },
  disponible: { icono: '▶', etiqueta: 'Empezar', bloqueada: false },
  completada: { icono: '✓', etiqueta: 'Completada', bloqueada: false },
};

export function LeccionItem({ leccion, onSelect }: LeccionItemProps) {
  const ui = ESTADO_UI[leccion.estado];

  return (
    <li className="bc-leccion">
      <button
        type="button"
        className={`bc-leccion__btn bc-leccion__btn--${leccion.estado}`}
        disabled={ui.bloqueada}
        aria-disabled={ui.bloqueada}
        onClick={() => {
          if (!ui.bloqueada) {
            onSelect(leccion.id);
          }
        }}
      >
        <span className="bc-leccion__icono" aria-hidden="true">
          {ui.icono}
        </span>
        <span className="bc-leccion__titulo">{leccion.titulo}</span>
        <span className="bc-leccion__estado">{ui.etiqueta}</span>
      </button>
    </li>
  );
}
