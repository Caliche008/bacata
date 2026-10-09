import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppearanceControls } from './AppearanceControls';
import { ThemeProvider } from './ThemeProvider';

function renderControls() {
  return render(
    <ThemeProvider>
      <AppearanceControls />
    </ThemeProvider>,
  );
}

describe('ThemeProvider + AppearanceControls', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-text-size');
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('cambia el tamaño de texto, lo aplica a <html> y lo persiste', async () => {
    const { unmount } = renderControls();

    await userEvent.click(screen.getByRole('button', { name: 'Grande' }));

    expect(document.documentElement.getAttribute('data-text-size')).toBe(
      'large',
    );
    expect(window.localStorage.getItem('bacata.textSize')).toBe('large');

    // Al recrear el provider, lee el valor guardado.
    unmount();
    renderControls();
    expect(document.documentElement.getAttribute('data-text-size')).toBe(
      'large',
    );
    expect(screen.getByRole('button', { name: 'Grande' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('activa el tema de alto contraste, lo aplica y lo persiste', async () => {
    const { unmount } = renderControls();

    await userEvent.click(
      screen.getByRole('button', { name: 'Alto contraste' }),
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'high-contrast',
    );
    expect(window.localStorage.getItem('bacata.theme')).toBe('high-contrast');

    unmount();
    renderControls();
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'high-contrast',
    );
  });
});
