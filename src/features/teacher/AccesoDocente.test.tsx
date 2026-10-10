import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccesoDocente } from './AccesoDocente';

/**
 * Pruebas de la pantalla de acceso docente (R6.5, R8.6): primer uso pide crear
 * PIN; un PIN inválido muestra error anunciado; un PIN correcto invoca onEntrar.
 */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('AccesoDocente', () => {
  it('primer uso muestra "Crea tu PIN de docente"', () => {
    render(<AccesoDocente onEntrar={() => {}} />);
    expect(
      screen.getByRole('heading', { name: /Crea tu PIN de docente/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('PIN de docente')).toBeInTheDocument();
  });

  it('crear un PIN válido invoca onEntrar', async () => {
    const user = userEvent.setup();
    const onEntrar = vi.fn();
    render(<AccesoDocente onEntrar={onEntrar} />);

    await user.type(screen.getByLabelText('PIN de docente'), '1234');
    await user.click(screen.getByRole('button', { name: /Crear PIN y entrar/i }));

    await waitFor(() => expect(onEntrar).toHaveBeenCalledTimes(1));
  });

  it('un PIN con formato inválido muestra un error anunciado y no entra', async () => {
    const user = userEvent.setup();
    const onEntrar = vi.fn();
    render(<AccesoDocente onEntrar={onEntrar} />);

    await user.type(screen.getByLabelText('PIN de docente'), '12');
    await user.click(screen.getByRole('button', { name: /Crear PIN y entrar/i }));

    const estado = await screen.findByRole('status');
    expect(estado).toHaveTextContent(/4 y 8 dígitos/i);
    expect(onEntrar).not.toHaveBeenCalled();
  });
});
