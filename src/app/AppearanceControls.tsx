import { useId } from 'react';
import type { TextSize, ThemeName } from '../lib/preferences';
import { useTheme } from './useTheme';
import './appearance-controls.css';

/**
 * Controles accesibles para elegir el tema (incl. alto contraste) y el tamaño
 * de texto. Cada grupo es un conjunto de botones con `aria-pressed`; el grupo
 * se anuncia con `role="group"` + `aria-labelledby`. Texto en español, tono de
 * marca. Las opciones cumplen el objetivo táctil de 44px (CSS).
 */

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'default', label: 'Normal' },
  { value: 'high-contrast', label: 'Alto contraste' },
];

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grande' },
  { value: 'xlarge', label: 'Muy grande' },
];

export function AppearanceControls() {
  const { theme, textSize, setTheme, setTextSize } = useTheme();
  const themeLabelId = useId();
  const sizeLabelId = useId();

  return (
    <div className="bc-appearance">
      <div
        className="bc-appearance__group"
        role="group"
        aria-labelledby={themeLabelId}
      >
        <span id={themeLabelId} className="bc-appearance__legend">
          Contraste
        </span>
        <div className="bc-appearance__options">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="bc-appearance__option"
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="bc-appearance__group"
        role="group"
        aria-labelledby={sizeLabelId}
      >
        <span id={sizeLabelId} className="bc-appearance__legend">
          Tamaño del texto
        </span>
        <div className="bc-appearance__options">
          {TEXT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="bc-appearance__option"
              aria-pressed={textSize === option.value}
              onClick={() => setTextSize(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
