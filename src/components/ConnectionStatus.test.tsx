import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConnectionStatus } from './ConnectionStatus';

/**
 * Pruebas del indicador de conexión (R5.7). Sin conexión muestra un aviso
 * accesible con `role="status"` + texto; con conexión no renderiza nada.
 */

afterEach(() => {
  vi.restoreAllMocks();
});

function setOnLine(value: boolean): void {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value);
}

describe('ConnectionStatus', () => {
  it('sin conexión muestra un aviso accesible con texto (no solo color)', () => {
    setOnLine(false);
    render(<ConnectionStatus />);

    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent(/sin conexión/i);
    expect(aviso).toHaveTextContent(/tu progreso se guarda/i);
  });

  it('con conexión no renderiza nada', () => {
    setOnLine(true);
    const { container } = render(<ConnectionStatus />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
