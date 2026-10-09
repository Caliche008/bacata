/**
 * Contexto de apariencia (tema + tamaño de texto).
 *
 * Se separa el contexto del provider para que el hook `useTheme` pueda vivir en
 * su propio archivo sin disparar la regla react-refresh de "solo componentes".
 */

import { createContext } from 'react';
import type { TextSize, ThemeName } from '../lib/preferences';

export interface ThemeContextValue {
  theme: ThemeName;
  textSize: TextSize;
  setTheme: (theme: ThemeName) => void;
  setTextSize: (size: TextSize) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
