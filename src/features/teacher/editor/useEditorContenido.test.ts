import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { closeDb, getDraft, resetDb } from '../../../lib/storage';
import { useEditorContenido } from './useEditorContenido';

/**
 * Pruebas del hook del editor con `fake-indexeddb` (patrón de
 * `useTeacherPanel.test.ts`): verifica carga, CRUD de unidades/lecciones,
 * reordenar, autosave en el store `borradoresContenido` y estabilidad de ids.
 */

const ID_BORRADOR = 'borrador-grado-6';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('useEditorContenido', () => {
  it('arranca creando un borrador vacío para el grado', async () => {
    const { result } = renderHook(() => useEditorContenido(6));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    expect(result.current.curso?.grado).toBe(6);
    expect(result.current.curso?.area).toBe('ciencias_sociales');
    expect(result.current.curso?.unidades).toHaveLength(0);
  });

  it('añadir unidad persiste en el store (autosave)', async () => {
    const { result } = renderHook(() => useEditorContenido(6));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    let unidadId = '';
    act(() => {
      unidadId = result.current.anadirUnidad();
    });

    expect(result.current.curso?.unidades).toHaveLength(1);

    await waitFor(async () => {
      const guardado = await getDraft(ID_BORRADOR);
      expect(guardado?.curso.unidades.some((u) => u.id === unidadId)).toBe(true);
    });
  });

  it('editar unidad conserva su id (estabilidad)', async () => {
    const { result } = renderHook(() => useEditorContenido(6));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    let unidadId = '';
    act(() => {
      unidadId = result.current.anadirUnidad();
    });
    act(() => {
      result.current.editarUnidad(unidadId, { titulo: 'Convivencia y paz' });
    });

    const unidad = result.current.curso?.unidades.find((u) => u.id === unidadId);
    expect(unidad?.id).toBe(unidadId);
    expect(unidad?.titulo).toBe('Convivencia y paz');
  });

  it('reordenar unidades cambia el orden y reasigna el campo orden', async () => {
    const { result } = renderHook(() => useEditorContenido(6));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    let a = '';
    let b = '';
    act(() => {
      a = result.current.anadirUnidad();
    });
    act(() => {
      b = result.current.anadirUnidad();
    });

    act(() => {
      result.current.moverUnidad(b, 'subir');
    });

    const unidades = result.current.curso?.unidades ?? [];
    expect(unidades[0]?.id).toBe(b);
    expect(unidades[1]?.id).toBe(a);
    expect(unidades[0]?.orden).toBe(1);
    expect(unidades[1]?.orden).toBe(2);
  });

  it('añade, edita, reordena y elimina lecciones dentro de una unidad', async () => {
    const { result } = renderHook(() => useEditorContenido(6));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    let unidadId = '';
    act(() => {
      unidadId = result.current.anadirUnidad();
    });

    let l1 = '';
    let l2 = '';
    act(() => {
      l1 = result.current.anadirLeccion(unidadId);
    });
    act(() => {
      l2 = result.current.anadirLeccion(unidadId);
    });
    act(() => {
      result.current.editarLeccion(unidadId, l1, { titulo: '¿Qué es un conflicto?' });
    });

    let unidad = result.current.curso?.unidades.find((u) => u.id === unidadId);
    expect(unidad?.lecciones).toHaveLength(2);
    expect(unidad?.lecciones.find((l) => l.id === l1)?.titulo).toBe('¿Qué es un conflicto?');

    act(() => {
      result.current.moverLeccion(unidadId, l2, 'subir');
    });
    unidad = result.current.curso?.unidades.find((u) => u.id === unidadId);
    expect(unidad?.lecciones[0]?.id).toBe(l2);

    act(() => {
      result.current.eliminarLeccion(unidadId, l1);
    });
    unidad = result.current.curso?.unidades.find((u) => u.id === unidadId);
    expect(unidad?.lecciones).toHaveLength(1);
    expect(unidad?.lecciones.some((l) => l.id === l1)).toBe(false);
  });

  it('eliminar una unidad la quita y persiste el cambio', async () => {
    const { result } = renderHook(() => useEditorContenido(6));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    let unidadId = '';
    act(() => {
      unidadId = result.current.anadirUnidad();
    });
    await waitFor(async () => {
      const guardado = await getDraft(ID_BORRADOR);
      expect(guardado?.curso.unidades).toHaveLength(1);
    });

    act(() => {
      result.current.eliminarUnidad(unidadId);
    });

    await waitFor(async () => {
      const guardado = await getDraft(ID_BORRADOR);
      expect(guardado?.curso.unidades).toHaveLength(0);
    });
  });
});
