import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GestionEstudiantes } from './GestionEstudiantes';

/** Pruebas de la UI de gestión de estudiantes (R6.6). */

const ESTUDIANTES = [
  { estudianteId: 'est-1', apodo: 'Explorador' },
  { estudianteId: 'est-2', apodo: 'Curiosa' },
];

function renderUI(
  overrides: Partial<Parameters<typeof GestionEstudiantes>[0]> = {},
) {
  const props = {
    estudiantes: ESTUDIANTES,
    onRenombrar: vi.fn().mockResolvedValue({ ok: true }),
    onEliminar: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  render(<GestionEstudiantes {...props} />);
  return props;
}

describe('GestionEstudiantes', () => {
  it('renombrar invoca onRenombrar con el nuevo apodo', async () => {
    const user = userEvent.setup();
    const props = renderUI();

    await user.click(screen.getAllByRole('button', { name: 'Renombrar' })[0]);
    const input = screen.getByLabelText('Nuevo apodo');
    await user.clear(input);
    await user.type(input, 'Viajera');
    await user.click(screen.getByRole('button', { name: 'Guardar apodo' }));

    expect(props.onRenombrar).toHaveBeenCalledWith('est-1', 'Viajera');
  });

  it('muestra el error de un renombrado rechazado', async () => {
    const user = userEvent.setup();
    renderUI({
      onRenombrar: vi.fn().mockResolvedValue({ ok: false, error: 'Apodo duplicado' }),
    });

    await user.click(screen.getAllByRole('button', { name: 'Renombrar' })[0]);
    await user.click(screen.getByRole('button', { name: 'Guardar apodo' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Apodo duplicado');
  });

  it('eliminar pide confirmación accesible antes de borrar', async () => {
    const user = userEvent.setup();
    const props = renderUI();

    await user.click(screen.getAllByRole('button', { name: 'Eliminar perfil' })[0]);

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(props.onEliminar).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(props.onEliminar).toHaveBeenCalledWith('est-1'));
  });

  it('cancelar el borrado no elimina', async () => {
    const user = userEvent.setup();
    const props = renderUI();

    await user.click(screen.getAllByRole('button', { name: 'Eliminar perfil' })[0]);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(props.onEliminar).not.toHaveBeenCalled();
  });
});
