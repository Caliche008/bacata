import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { closeDb, putProfile, resetDb } from '../../lib/storage';
import { getActiveSessionId } from '../../lib/preferences/session';
import { SessionProvider } from './SessionProvider';
import { AccesoEstudiante } from './AccesoEstudiante';
import { useSession } from './useSession';

/**
 * Pruebas de sesión (f del brief) y del bloqueo por intentos (vía la pantalla).
 * BD y localStorage limpios por prueba.
 */

const CODIGO = 'ABC234';

/** Expone el apodo y un botón de "cerrar sesión" para las aserciones. */
function PanelSesion() {
  const { perfil, cargando, cerrarSesion } = useSession();
  if (cargando) {
    return <p>cargando</p>;
  }
  return perfil ? (
    <div>
      <p>Sesión: {perfil.apodo}</p>
      <button type="button" onClick={cerrarSesion}>
        salir
      </button>
    </div>
  ) : (
    <p>Sin sesión</p>
  );
}

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
  resetDb();
  window.localStorage.clear();
});

afterEach(async () => {
  await closeDb();
  window.localStorage.clear();
});

describe('SessionProvider — recuperación de sesión (R1.4)', () => {
  it('recupera el perfil al arrancar si hay sesión persistida, sin re-pedir código', async () => {
    // Simula un perfil ya creado y una sesión activa persistida.
    await putProfile({
      id: 'est-1',
      apodo: 'Explorador',
      codigoClase: CODIGO,
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });
    window.localStorage.setItem('bacata.session', 'est-1');

    render(
      <SessionProvider>
        <PanelSesion />
      </SessionProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText('Sesión: Explorador')).toBeInTheDocument(),
    );
    // No se muestra la pantalla de acceso: no re-pide el código.
    expect(screen.queryByLabelText('Código de tu clase')).toBeNull();
  });

  it('cerrar sesión limpia la sesión activa pero conserva el perfil', async () => {
    const user = userEvent.setup();
    await putProfile({
      id: 'est-1',
      apodo: 'Explorador',
      codigoClase: CODIGO,
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });
    window.localStorage.setItem('bacata.session', 'est-1');

    render(
      <SessionProvider>
        <PanelSesion />
      </SessionProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText('Sesión: Explorador')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'salir' }));

    await waitFor(() =>
      expect(screen.getByText('Sin sesión')).toBeInTheDocument(),
    );
    expect(getActiveSessionId()).toBeNull();
  });
});

describe('AccesoEstudiante — bloqueo por intentos (R1.8)', () => {
  it('bloquea el ingreso tras varios códigos con formato inválido', async () => {
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <AccesoEstudiante />
      </SessionProvider>,
    );

    const codigo = screen.getByLabelText('Código de tu clase');
    const apodo = screen.getByLabelText('Tu apodo');
    await user.type(apodo, 'Explorador');

    // 5 intentos con formato inválido disparan el bloqueo temporal.
    for (let i = 0; i < 5; i += 1) {
      await user.clear(codigo);
      await user.type(codigo, 'AB1');
      await user.click(screen.getByRole('button', { name: /Entrar|Espera/ }));
    }

    expect(await screen.findByText(/Demasiados intentos/i)).toBeInTheDocument();
    // El botón queda deshabilitado durante el bloqueo.
    expect(screen.getByRole('button', { name: /Espera/ })).toBeDisabled();
  });
});
