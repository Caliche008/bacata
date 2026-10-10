import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../app/ThemeProvider';
import { ContenidoNoDisponible } from './ContenidoNoDisponible';

/**
 * Pruebas del aviso de contenido no disponible (R5.7). El mensaje se adapta a la
 * conexión y es accesible (`role="status"` + texto). El botón vuelve a la ruta.
 */

afterEach(() => {
  vi.restoreAllMocks();
});

function setOnLine(value: boolean): void {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value);
}

describe('ContenidoNoDisponible', () => {
  it('sin conexión indica cómo obtener el contenido (conectarse una vez)', () => {
    setOnLine(false);
    render(
      <ThemeProvider>
        <ContenidoNoDisponible onVolver={() => {}} />
      </ThemeProvider>,
    );

    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent(/sin conexión/i);
    expect(aviso).toHaveTextContent(/conéctate una vez/i);
  });

  it('con conexión indica que puede llegar en una actualización', () => {
    setOnLine(true);
    render(
      <ThemeProvider>
        <ContenidoNoDisponible onVolver={() => {}} />
      </ThemeProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/actualización/i);
  });

  it('el botón "Volver a mi ruta" invoca onVolver', async () => {
    setOnLine(true);
    const onVolver = vi.fn();
    render(
      <ThemeProvider>
        <ContenidoNoDisponible onVolver={onVolver} />
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /volver a mi ruta/i }));
    expect(onVolver).toHaveBeenCalledTimes(1);
  });
});
