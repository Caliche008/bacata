import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { closeDb, getProfilesByClassCode, resetDb } from '../../lib/storage';
import { SessionProvider } from './SessionProvider';
import { AccesoEstudiante } from './AccesoEstudiante';
import { useSession } from './useSession';

/**
 * Pruebas de la pantalla de acceso (e, g del brief) con fake-indexeddb y
 * Testing Library. Cada prueba corre sobre BD y localStorage limpios.
 */

const CODIGO = 'ABC234';

/** Muestra el apodo activo para comprobar que la sesión se inició. */
function SesionActiva() {
  const { perfil } = useSession();
  return perfil ? <p>Sesión: {perfil.apodo}</p> : <p>Sin sesión</p>;
}

function renderAcceso() {
  return render(
    <SessionProvider>
      <SesionActiva />
      <AccesoEstudiante />
    </SessionProvider>,
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

describe('AccesoEstudiante — accesibilidad y privacidad', () => {
  it('expone labels asociadas y no pide PII', () => {
    renderAcceso();

    expect(screen.getByLabelText('Código de tu clase')).toBeInTheDocument();
    expect(screen.getByLabelText('Tu apodo')).toBeInTheDocument();
    expect(
      screen.getByRole('radiogroup', { name: 'Tu grado' }),
    ).toBeInTheDocument();

    // No existen campos de nombre real, correo, teléfono (R1.2).
    expect(screen.queryByLabelText(/correo/i)).toBeNull();
    expect(screen.queryByLabelText(/tel[eé]fono/i)).toBeNull();
    expect(screen.queryByLabelText(/nombre/i)).toBeNull();
  });

  it('muestra el aviso de solo-local (R1.9) y de no usar nombre real (R1.7)', () => {
    renderAcceso();
    expect(
      screen.getByText('Tu progreso se guarda solo en este dispositivo.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/No uses tu nombre real/i)).toBeInTheDocument();
  });
});

describe('AccesoEstudiante — validaciones', () => {
  it('código inválido muestra error y NO crea perfil (R1.3)', async () => {
    const user = userEvent.setup();
    renderAcceso();

    await user.type(screen.getByLabelText('Código de tu clase'), 'AB1');
    await user.type(screen.getByLabelText('Tu apodo'), 'Explorador');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText(/Revisa el código de tu clase/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
  });

  it('apodo ofensivo se rechaza (R1.7)', async () => {
    const user = userEvent.setup();
    renderAcceso();

    await user.type(screen.getByLabelText('Código de tu clase'), CODIGO);
    await user.type(screen.getByLabelText('Tu apodo'), 'tonto');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText(/no es apropiado/i)).toBeInTheDocument();
    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
  });

  it('ingreso válido crea perfilEstudiante en storage e inicia sesión (R1.1)', async () => {
    const user = userEvent.setup();
    renderAcceso();

    await user.type(screen.getByLabelText('Código de tu clase'), CODIGO);
    await user.type(screen.getByLabelText('Tu apodo'), 'Explorador');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByText('Sesión: Explorador')).toBeInTheDocument(),
    );

    const perfiles = await getProfilesByClassCode(CODIGO);
    expect(perfiles).toHaveLength(1);
    expect(perfiles[0]).toMatchObject({
      apodo: 'Explorador',
      codigoClase: CODIGO,
      grado: 6,
    });
    // Sin PII: solo los campos del contrato.
    expect(Object.keys(perfiles[0]).sort()).toEqual([
      'apodo',
      'codigoClase',
      'creadoEn',
      'grado',
      'id',
    ]);
  });

  it('apodo duplicado en la misma clase recupera el perfil, no duplica (R1.6)', async () => {
    const user = userEvent.setup();

    // Primer ingreso crea el perfil.
    const primero = renderAcceso();
    await user.type(screen.getByLabelText('Código de tu clase'), CODIGO);
    await user.type(screen.getByLabelText('Tu apodo'), 'Explorador');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() =>
      expect(screen.getByText('Sesión: Explorador')).toBeInTheDocument(),
    );
    primero.unmount();
    window.localStorage.removeItem('bacata.session');

    // Segundo ingreso con el mismo apodo + código: recupera, no duplica.
    renderAcceso();
    await user.type(screen.getByLabelText('Código de tu clase'), CODIGO);
    await user.type(screen.getByLabelText('Tu apodo'), 'explorador');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() =>
      expect(screen.getByText('Sesión: Explorador')).toBeInTheDocument(),
    );

    expect(await getProfilesByClassCode(CODIGO)).toHaveLength(1);
  });
});
