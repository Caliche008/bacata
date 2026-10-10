import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ClaseLocal } from '../../lib/storage';
import { GestionClases } from './GestionClases';

/** Pruebas de la UI de clases (R6.1, R6.7). */

const CLASE: ClaseLocal = {
  id: 'c1',
  codigo: 'ABC234',
  unidadesActivas: [],
  docentePinHash: 'salt:hash',
};

function renderUI(overrides: Partial<Parameters<typeof GestionClases>[0]> = {}) {
  const props = {
    clases: [CLASE],
    claseSeleccionada: CLASE,
    onSeleccionar: vi.fn(),
    onCrear: vi.fn().mockResolvedValue(undefined),
    onRegenerar: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  render(<GestionClases {...props} />);
  return props;
}

describe('GestionClases', () => {
  it('muestra el código de la clase', () => {
    renderUI();
    expect(screen.getByText('ABC234')).toBeInTheDocument();
  });

  it('crear invoca onCrear con el grado elegido', async () => {
    const user = userEvent.setup();
    const props = renderUI({ clases: [], claseSeleccionada: null });

    await user.click(screen.getByRole('radio', { name: '7°' }));
    await user.click(screen.getByRole('button', { name: 'Crear clase' }));

    expect(props.onCrear).toHaveBeenCalledWith(7, []);
  });

  it('regenerar pide confirmación antes de llamar al servicio', async () => {
    const user = userEvent.setup();
    const props = renderUI();

    await user.click(screen.getByRole('button', { name: 'Regenerar código' }));

    // Aparece el diálogo; aún no se ha regenerado.
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toBeInTheDocument();
    expect(props.onRegenerar).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Regenerar' }));
    expect(props.onRegenerar).toHaveBeenCalledWith('c1');
  });

  it('cancelar cierra el diálogo sin regenerar', async () => {
    const user = userEvent.setup();
    const props = renderUI();

    await user.click(screen.getByRole('button', { name: 'Regenerar código' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(props.onRegenerar).not.toHaveBeenCalled();
  });
});
