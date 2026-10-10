import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeccionErrorBoundary } from './LeccionErrorBoundary';

/**
 * Pruebas de la red de seguridad del flujo de lección. Un hijo que lanza en
 * render NO debe dejar una pantalla en blanco: el boundary muestra un mensaje
 * accesible (texto + role="alert") y un botón para volver a la ruta. Esta prueba
 * es la contraparte directa del bug reportado (crash → pantalla en blanco).
 */

function Explosivo(): never {
  throw new Error('fallo de render de prueba');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LeccionErrorBoundary — recuperación accesible', () => {
  it('muestra el aviso con role=alert en vez de propagar la excepción', () => {
    // React registra el error en consola aunque el boundary lo capture: lo
    // silenciamos para no ensuciar la salida de la prueba.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <LeccionErrorBoundary onVolver={vi.fn()}>
        <Explosivo />
      </LeccionErrorBoundary>,
    );

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent(/Vuelve a la ruta e inténtalo de nuevo/);
    expect(screen.getByText('Se nos cruzó un cable')).toBeInTheDocument();
  });

  it('al pulsar "Volver a la ruta" invoca onVolver', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onVolver = vi.fn();
    const user = userEvent.setup();

    render(
      <LeccionErrorBoundary onVolver={onVolver}>
        <Explosivo />
      </LeccionErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: 'Volver a la ruta' }));
    expect(onVolver).toHaveBeenCalledTimes(1);
  });

  it('renderiza los hijos cuando no hay error', () => {
    render(
      <LeccionErrorBoundary onVolver={vi.fn()}>
        <p>Contenido normal</p>
      </LeccionErrorBoundary>,
    );
    expect(screen.getByText('Contenido normal')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
