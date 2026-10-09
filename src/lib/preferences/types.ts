/**
 * Tipos de las preferencias de interfaz (tema y tamaño de texto).
 *
 * Estas preferencias NO son datos personales (PII): describen cómo se ve la UI
 * en este dispositivo, no quién es el estudiante. Se persisten en localStorage
 * (ver `index.ts`) de forma independiente del progreso pedagógico (IndexedDB),
 * respetando la separación "presentación vs. datos".
 */

/** Tema visual seleccionable. `high-contrast` refuerza contraste y bordes. */
export type ThemeName = 'default' | 'high-contrast';

/** Escala de tamaño de texto. Nunca baja de 16px (ver `text-size.css`). */
export type TextSize = 'normal' | 'large' | 'xlarge';

/** Conjunto de preferencias de apariencia. */
export interface AppearancePreferences {
  theme: ThemeName;
  textSize: TextSize;
}

export const THEME_VALUES: readonly ThemeName[] = ['default', 'high-contrast'];
export const TEXT_SIZE_VALUES: readonly TextSize[] = ['normal', 'large', 'xlarge'];

export const DEFAULT_THEME: ThemeName = 'default';
export const DEFAULT_TEXT_SIZE: TextSize = 'normal';
