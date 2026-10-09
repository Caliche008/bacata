/**
 * Capa de preferencias de interfaz sobre `localStorage`.
 *
 * Por qué localStorage (y no la capa IndexedDB de `src/lib/storage`):
 * - La preferencia debe aplicarse ANTES del primer render para evitar un
 *   parpadeo (FOUC) de tema/tamaño; IndexedDB es asíncrono.
 * - IndexedDB está acoplado al progreso del estudiante; la apariencia es
 *   presentación, no dato pedagógico. Mantenerlos separados respeta la regla
 *   "separar presentación de datos".
 *
 * Privacidad (Ley 1581): aquí NO se guarda PII. Solo dos claves con el tema y
 * el tamaño de texto. Ningún componente accede a localStorage directamente:
 * pasa siempre por esta API tipada.
 */

import {
  DEFAULT_TEXT_SIZE,
  DEFAULT_THEME,
  TEXT_SIZE_VALUES,
  THEME_VALUES,
  type AppearancePreferences,
  type TextSize,
  type ThemeName,
} from './types';

export type { ThemeName, TextSize, AppearancePreferences } from './types';
export {
  THEME_VALUES,
  TEXT_SIZE_VALUES,
  DEFAULT_THEME,
  DEFAULT_TEXT_SIZE,
} from './types';

/** Claves namespaced para evitar colisiones con otras apps en el mismo origen. */
const THEME_KEY = 'bacata.theme';
const TEXT_SIZE_KEY = 'bacata.textSize';

/**
 * Acceso seguro a localStorage. En entornos sin almacenamiento (modo privado
 * estricto, SSR, pruebas) devuelve null en vez de lanzar.
 */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento disponible: la preferencia sigue aplicándose en memoria
    // durante la sesión; simplemente no persiste. No es un error fatal.
  }
}

function isTheme(value: string | null): value is ThemeName {
  return value !== null && (THEME_VALUES as readonly string[]).includes(value);
}

function isTextSize(value: string | null): value is TextSize {
  return value !== null && (TEXT_SIZE_VALUES as readonly string[]).includes(value);
}

export function getThemePreference(): ThemeName {
  const stored = safeGet(THEME_KEY);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

export function setThemePreference(theme: ThemeName): void {
  safeSet(THEME_KEY, theme);
}

export function getTextSizePreference(): TextSize {
  const stored = safeGet(TEXT_SIZE_KEY);
  return isTextSize(stored) ? stored : DEFAULT_TEXT_SIZE;
}

export function setTextSizePreference(textSize: TextSize): void {
  safeSet(TEXT_SIZE_KEY, textSize);
}

/** Lee ambas preferencias con defaults seguros (útil en el arranque). */
export function getAppearancePreferences(): AppearancePreferences {
  return {
    theme: getThemePreference(),
    textSize: getTextSizePreference(),
  };
}
