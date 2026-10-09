import type { ReactNode } from 'react';
import './components.css';

export type FeedbackState = 'correcto' | 'incorrecto' | 'info';

export interface FeedbackProps {
  state: FeedbackState;
  message: string;
  hint?: string;
  icon?: ReactNode;
}

/**
 * Microcopy por defecto de brand.md para los estados evaluables.
 * El tono nunca castiga el error: invita a reintentar.
 */
const DEFAULT_MESSAGE: Record<FeedbackState, string> = {
  correcto: '¡Muy bien! Así se razona.',
  incorrecto: 'Casi. Mira esta pista y vuelve a intentarlo.',
  info: 'Ten esto en cuenta.',
};

/**
 * Íconos SVG inline, ligeros y `aria-hidden`: el significado SIEMPRE va en el
 * texto, no en el ícono ni en el color. Así el estado se transmite por
 * texto + ícono (y color como refuerzo), nunca solo por color.
 */
function FeedbackIcon({ state }: { state: FeedbackState }) {
  return (
    <svg
      className="bc-feedback__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {state === 'correcto' && <path d="M4 12.5l5 5L20 6.5" />}
      {state === 'incorrecto' && (
        /* flecha de reintento (no una "X" de castigo): tono motivador */
        <>
          <path d="M4 9a8 8 0 1 1-1 4" />
          <path d="M4 4v5h5" />
        </>
      )}
      {state === 'info' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 7.5h.01" />
        </>
      )}
    </svg>
  );
}

/**
 * Retroalimentación accesible. `role="status"` + `aria-live="polite"` para que
 * el lector de pantalla la anuncie sin interrumpir de forma hostil. Combina
 * SIEMPRE ícono + texto (+ color como refuerzo): el estado nunca depende solo
 * del color.
 */
export function Feedback({ state, message, hint, icon }: FeedbackProps) {
  const text = message || DEFAULT_MESSAGE[state];

  return (
    <div
      className={`bc-feedback bc-feedback--${state}`}
      role="status"
      aria-live="polite"
    >
      {icon ?? <FeedbackIcon state={state} />}
      <div className="bc-feedback__body">
        <p className="bc-feedback__message">{text}</p>
        {hint ? <p className="bc-feedback__hint">{hint}</p> : null}
      </div>
    </div>
  );
}
