import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { closeDb, putProfile, resetDb } from '../lib/storage';
import App from './App';
import { SPLASH_MIN_MS } from './useSplashMinimo';
import { ThemeProvider } from './ThemeProvider';

/**
 * Pruebas del gate de sesión (g del brief). Sin sesión → pantalla de acceso;
 * con sesión persistida → ruta de aprendizaje con el saludo al estudiante.
 *
 * El arranque muestra el splash de marca durante un mínimo de 2.3 s
 * (`SPLASH_MIN_MS`), así que cada prueba usa fake timers y avanza el reloj ese
 * mínimo antes de esperar el contenido. Se usa `shouldAdvanceTime: true` para
 * que `userEvent` y las promesas de IndexedDB sigan resolviendo con normalidad.
 */

beforeEach(async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
  resetDb();
  window.localStorage.clear();
});

afterEach(async () => {
  await closeDb();
  window.localStorage.clear();
  vi.useRealTimers();
});

/** Avanza el reloj hasta cumplir el mínimo de visibilidad del splash. */
function cumplirSplash() {
  act(() => {
    vi.advanceTimersByTime(SPLASH_MIN_MS);
  });
}

describe('App — gate de sesión', () => {
  it('sin sesión muestra la pantalla de acceso del estudiante', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    cumplirSplash();

    await waitFor(() =>
      expect(screen.getByLabelText('Código de tu clase')).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Tu apodo')).toBeInTheDocument();
  });

  it('al pulsar "Soy docente" monta el panel docente (lazy)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    cumplirSplash();

    await waitFor(() =>
      expect(screen.getByLabelText('Código de tu clase')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Soy docente' }));

    // El panel es un chunk lazy: aparece el acceso docente tras cargarlo.
    expect(
      await screen.findByRole('heading', { name: /PIN de docente/i }),
    ).toBeInTheDocument();
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

    cumplirSplash();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '¡Hola, Explorador!' }),
      ).toBeInTheDocument(),
    );
  });

  it('respeta el mínimo de 2.3 s del splash aun con sesión activa', async () => {
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

    // Justo antes de cumplir el mínimo, el splash sigue visible y la ruta no.
    act(() => {
      vi.advanceTimersByTime(SPLASH_MIN_MS - 1);
    });
    expect(
      screen.getByRole('status', { name: 'Cargando Bacatá' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '¡Hola, Explorador!' }),
    ).not.toBeInTheDocument();

    // Al cumplir el mínimo (y con la sesión ya resuelta) aparece la ruta.
    act(() => {
      vi.advanceTimersByTime(1);
    });
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '¡Hola, Explorador!' }),
      ).toBeInTheDocument(),
    );
  });
});
