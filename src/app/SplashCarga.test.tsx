import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SplashCarga } from './SplashCarga';
import { ThemeProvider } from './ThemeProvider';

/**
 * El splash de arranque muestra la marca "Bacatá" y el lema "Aprende jugando"
 * como texto real y anuncia el estado de carga al lector de pantalla.
 */
describe('SplashCarga', () => {
  it('muestra "Bacatá" y "Aprende jugando" como texto', () => {
    render(
      <ThemeProvider>
        <SplashCarga />
      </ThemeProvider>,
    );

    expect(screen.getByText('Bacatá')).toBeInTheDocument();
    expect(screen.getByText('Aprende jugando')).toBeInTheDocument();
  });

  it('anuncia el estado de carga con role="status" y aria-busy', () => {
    render(
      <ThemeProvider>
        <SplashCarga />
      </ThemeProvider>,
    );

    const estado = screen.getByRole('status');
    expect(estado).toHaveAttribute('aria-busy', 'true');
    expect(estado).toHaveAttribute('aria-label', 'Cargando Bacatá');
  });
});
