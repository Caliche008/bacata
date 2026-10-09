import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  getTextSizePreference,
  getThemePreference,
  setTextSizePreference,
  setThemePreference,
  type TextSize,
  type ThemeName,
} from '../lib/preferences';
import { ThemeContext } from './theme-context';

/**
 * Aplica tema y tamaño de texto a <html> como atributos de datos, de modo que
 * los selectores de CSS (tokens.css, text-size.css) cambien sin re-render de
 * componentes. Lee el valor inicial de la capa de preferencias (localStorage) y
 * persiste cada cambio. No guarda datos del estudiante.
 */

function applyTheme(theme: ThemeName): void {
  document.documentElement.setAttribute('data-theme', theme);
}

function applyTextSize(size: TextSize): void {
  document.documentElement.setAttribute('data-text-size', size);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(() => getThemePreference());
  const [textSize, setTextSizeState] = useState<TextSize>(() =>
    getTextSizePreference(),
  );

  // Sincroniza los atributos del documento con el estado actual.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyTextSize(textSize);
  }, [textSize]);

  const setTheme = useCallback((next: ThemeName) => {
    setThemePreference(next);
    setThemeState(next);
  }, []);

  const setTextSize = useCallback((next: TextSize) => {
    setTextSizePreference(next);
    setTextSizeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, textSize, setTheme, setTextSize }}>
      {children}
    </ThemeContext.Provider>
  );
}
