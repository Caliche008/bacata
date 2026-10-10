import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Pruebas del borrado de datos del propio estudiante (R8.3).
 *
 * Se mockea `deleteStudentData` de `lib/storage` (no se toca IndexedDB real) y
 * `useSession` de `auth` para simular una sesión activa y poder verificar que
 * se cierra tras borrar.
 */

const deleteStudentData = vi.fn();
const cerrarSesion = vi.fn();

vi.mock('../../lib/storage', () => ({
  deleteStudentData: (...args: unknown[]) => deleteStudentData(...args),
}));

vi.mock('../auth', () => ({
  useSession: () => ({
    perfil: { id: 'est-123', apodo: 'Explorador', codigoClase: 'ABC123', grado: 6 },
    cargando: false,
    iniciarSesion: vi.fn(),
    cerrarSesion,
  }),
}));

import { BorrarMisDatos } from './BorrarMisDatos';

beforeEach(() => {
  deleteStudentData.mockReset();
  cerrarSesion.mockReset();
  deleteStudentData.mockResolvedValue(undefined);
});

describe('BorrarMisDatos', () => {
  it('pide confirmación accesible antes de borrar', async () => {
    const user = userEvent.setup();
    render(<BorrarMisDatos />);

    await user.click(screen.getByRole('button', { name: 'Borrar mis datos' }));

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    // Aún no se ha borrado nada: solo se abrió el diálogo.
    expect(deleteStudentData).not.toHaveBeenCalled();
  });

  it('cancelar cierra el diálogo sin borrar', async () => {
    const user = userEvent.setup();
    render(<BorrarMisDatos />);

    await user.click(screen.getByRole('button', { name: 'Borrar mis datos' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(deleteStudentData).not.toHaveBeenCalled();
    expect(cerrarSesion).not.toHaveBeenCalled();
  });

  it('confirmar invoca el borrado de storage con el id y cierra la sesión', async () => {
    const user = userEvent.setup();
    render(<BorrarMisDatos />);

    await user.click(screen.getByRole('button', { name: 'Borrar mis datos' }));
    await user.click(screen.getByRole('button', { name: 'Borrar' }));

    await waitFor(() => expect(deleteStudentData).toHaveBeenCalledWith('est-123'));
    await waitFor(() => expect(cerrarSesion).toHaveBeenCalledTimes(1));
  });

  it('si el borrado falla, muestra un error accesible y no cierra la sesión', async () => {
    deleteStudentData.mockRejectedValue(new Error('fallo'));
    const user = userEvent.setup();
    render(<BorrarMisDatos />);

    await user.click(screen.getByRole('button', { name: 'Borrar mis datos' }));
    await user.click(screen.getByRole('button', { name: 'Borrar' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      /No pudimos borrar tus datos/i,
    );
    expect(cerrarSesion).not.toHaveBeenCalled();
  });
});
