import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { closeDb, resetDb } from '../../lib/storage';
import { setTeacherPinHash, setTeacherSession } from '../../lib/preferences';
import { hashPin } from './pin';
import { PanelDocente } from './PanelDocente';

/**
 * Pruebas del shell del panel docente (R6.5): sin sesión muestra el acceso;
 * con sesión muestra las secciones y el acceso docente es separado del
 * estudiante.
 */

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
  window.localStorage.clear();
});

afterEach(async () => {
  await closeDb();
  window.localStorage.clear();
});

describe('PanelDocente', () => {
  it('sin sesión docente muestra el acceso (crear PIN)', async () => {
    render(<PanelDocente onSalir={() => {}} />);
    expect(
      await screen.findByRole('heading', { name: /Crea tu PIN de docente/i }),
    ).toBeInTheDocument();
  });

  it('con sesión activa muestra la navegación del panel', async () => {
    setTeacherPinHash(await hashPin('1234'));
    setTeacherSession(true);

    render(<PanelDocente onSalir={() => {}} />);

    expect(
      await screen.findByRole('navigation', { name: 'Secciones del panel' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Panel del docente' })).toBeInTheDocument();
  });

  it('"Salir del panel" cierra la sesión y vuelve al acceso del estudiante', async () => {
    const user = userEvent.setup();
    setTeacherPinHash(await hashPin('1234'));
    setTeacherSession(true);
    const onSalir = vi.fn();

    render(<PanelDocente onSalir={onSalir} />);
    await screen.findByRole('navigation', { name: 'Secciones del panel' });

    await user.click(screen.getByRole('button', { name: 'Salir del panel' }));
    await waitFor(() => expect(onSalir).toHaveBeenCalledTimes(1));
  });
});
