import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './theme-context';

/**
 * Acceso al tema y al tamaño de texto. Debe usarse dentro de `<ThemeProvider>`.
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  }
  return value;
}
