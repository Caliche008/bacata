import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, putProfile, resetDb } from '../lib/storage';
import App from './App';
import { ThemeProvider } from './ThemeProvider';

/**
 * Pruebas del gate de sesión (g del brief). Sin sesión → pantalla de acceso;
 * con sesión persistida → ruta de aprendizaje con el saludo al estudiante.
 */

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

describe('App — gate de sesión', () => {
  it('sin sesión muestra la pantalla de acceso del estudiante', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Código de tu clase')).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Tu apodo')).toBeInTheDocument();
  });

  it('con sesión muestra la ruta de aprendizaje con el apodo', async () => {
    await putProfile({
      id: 'est-1',
      apodo: 'Explorador',
      codigoClase: 'ABC234',
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });
    window.localStorage.setItem('bacata.session', 'est-1');

    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '¡Hola, Explorador!' }),
      ).toBeInTheDocument(),
    );
  });
});
