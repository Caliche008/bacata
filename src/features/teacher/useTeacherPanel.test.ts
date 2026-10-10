import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { closeDb, resetDb } from '../../lib/storage';
import { useTeacherPanel } from './useTeacherPanel';

/**
 * Pruebas del hook de datos del panel docente (item 10): carga clases, crear
 * añade una, estados de carga correctos.
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

describe('useTeacherPanel', () => {
  it('arranca sin clases y termina de cargar', async () => {
    const { result } = renderHook(() => useTeacherPanel());
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.clases).toHaveLength(0);
    expect(result.current.claseSeleccionada).toBeNull();
  });

  it('crear una clase la añade y la selecciona', async () => {
    const { result } = renderHook(() => useTeacherPanel());
    await waitFor(() => expect(result.current.cargando).toBe(false));

    await act(async () => {
      await result.current.nuevaClase(6, []);
    });

    await waitFor(() => expect(result.current.clases).toHaveLength(1));
    expect(result.current.claseSeleccionada).not.toBeNull();
    expect(result.current.gradoSeleccionado).toBe(6);
  });

  it('regenerar cambia el código de la clase seleccionada', async () => {
    const { result } = renderHook(() => useTeacherPanel());
    await waitFor(() => expect(result.current.cargando).toBe(false));

    await act(async () => {
      await result.current.nuevaClase(6, []);
    });
    await waitFor(() => expect(result.current.clases).toHaveLength(1));
    const codigoViejo = result.current.claseSeleccionada?.codigo;
    const id = result.current.claseSeleccionada?.id as string;

    await act(async () => {
      await result.current.regenerar(id);
    });

    await waitFor(() =>
      expect(result.current.claseSeleccionada?.codigo).not.toBe(codigoViejo),
    );
  });
});
