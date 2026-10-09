import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getProgressForLesson, resetDb } from '../../lib/storage';
import { cargarProgresoLeccion, guardarParcial, marcarCompletada } from './leccion-progreso';

/**
 * Pruebas del wrapper de progreso (9.5c) con `fake-indexeddb`: `guardarParcial`
 * crea `en_progreso` con `parcial` (R3.9); `marcarCompletada` fija `completada`
 * y `completadaEn` (R3.4). Se recrea la BD por prueba, como en `storage.test.ts`.
 */

const ESTUDIANTE = 'est-1';
const LECCION = 'l6-conv-1';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('guardarParcial (R3.9)', () => {
  it('crea un progreso en_progreso con el índice parcial', async () => {
    await guardarParcial(ESTUDIANTE, LECCION, 3);
    const guardado = await getProgressForLesson(ESTUDIANTE, LECCION);
    expect(guardado?.estado).toBe('en_progreso');
    expect(guardado?.parcial).toBe(3);
    expect(guardado?.completadaEn).toBeNull();
  });

  it('reutiliza el mismo registro al actualizar el parcial', async () => {
    await guardarParcial(ESTUDIANTE, LECCION, 1);
    const primero = await cargarProgresoLeccion(ESTUDIANTE, LECCION);
    await guardarParcial(ESTUDIANTE, LECCION, 2, primero);
    const segundo = await getProgressForLesson(ESTUDIANTE, LECCION);
    expect(segundo?.id).toBe(primero?.id);
    expect(segundo?.parcial).toBe(2);
  });
});

describe('marcarCompletada (R3.4)', () => {
  it('fija completada, completadaEn y limpia el parcial', async () => {
    await guardarParcial(ESTUDIANTE, LECCION, 2);
    const previo = await cargarProgresoLeccion(ESTUDIANTE, LECCION);
    await marcarCompletada(ESTUDIANTE, LECCION, 5, previo);
    const completado = await getProgressForLesson(ESTUDIANTE, LECCION);
    expect(completado?.estado).toBe('completada');
    expect(completado?.aciertos).toBe(5);
    expect(completado?.completadaEn).not.toBeNull();
    expect(completado?.parcial).toBeUndefined();
    expect(completado?.id).toBe(previo?.id);
  });

  it('no sobrescribe una lección completada al guardar parcial', async () => {
    await marcarCompletada(ESTUDIANTE, LECCION, 4);
    const completado = await cargarProgresoLeccion(ESTUDIANTE, LECCION);
    await guardarParcial(ESTUDIANTE, LECCION, 1, completado);
    const despues = await getProgressForLesson(ESTUDIANTE, LECCION);
    expect(despues?.estado).toBe('completada');
  });
});
