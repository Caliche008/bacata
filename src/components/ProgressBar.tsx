import { useId } from 'react';
import './components.css';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  showText?: boolean;
}

/**
 * Barra de progreso accesible. Expone `role="progressbar"` con
 * `aria-valuenow/min/max` y una etiqueta en español. El porcentaje también se
 * muestra como texto visible (no se transmite solo con el color/relleno).
 * El relleno anima vía CSS, que respeta `prefers-reduced-motion` globalmente.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  showText = true,
}: ProgressBarProps) {
  const labelId = useId();
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className="bc-progress">
      <div className="bc-progress__header">
        <span id={labelId}>{label}</span>
        {showText ? <span>{percent} %</span> : null}
      </div>
      <div
        className="bc-progress__track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={`${percent} %`}
      >
        <div className="bc-progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
