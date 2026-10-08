import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, resetDb } from './db';
import { getAllProfiles, getProfile, putProfile } from './profiles';
import { getProgressByStudent, putProgress } from './progress';
import { getGamification, putGamification } from './gamification';
import { getReviewByStudent, putReview, reviewId } from './review';
import { getClass, putClass } from './classes';
import { enqueueSyncEvent, getSyncQueueByStudent } from './syncQueue';
import { deleteClassData, deleteStudentData } from './deletion';
import type { PerfilEstudiante } from './types';

/**
 * Pruebas del borrado (derecho de supresión — Ley 1581, R8.3). Siembran datos
 * de un estudiante y de una clase, luego verifican que no queda rastro.
 */

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

/** Siembra un estudiante con progreso, gamificación, repaso y un evento de sync. */
async function seedStudent(perfil: PerfilEstudiante): Promise<void> {
  await putProfile(perfil);
  await putProgress({
    id: `prog-${perfil.id}`,
    estudianteId: perfil.id,
    leccionId: 'l6-conv-1',
    estado: 'completada',
    aciertos: 2,
    completadaEn: '2024-01-02T00:00:00.000Z',
  });
  await putGamification({
    estudianteId: perfil.id,
    xp: 20,
    rachaActual: 1,
    mejorRacha: 1,
    ultimaFechaActiva: '2024-01-02',
    logros: [],
  });
  await putReview({
    id: reviewId(perfil.id, 'ej-1'),
    estudianteId: perfil.id,
    ejercicioId: 'ej-1',
    fallos: 1,
    proximaAparicion: 1_700_000_000_000,
  });
  await enqueueSyncEvent({
    estudianteId: perfil.id,
    tipo: 'progreso',
    payload: { leccionId: 'l6-conv-1' },
    creadoEn: '2024-01-02T00:00:00.000Z',
  });
}

describe('deleteStudentData', () => {
  it('borra perfil, progreso, gamificación, repaso y eventos del estudiante', async () => {
    await seedStudent({
      id: 'est-1',
      apodo: 'Explorador',
      codigoClase: 'ABC123',
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });

    await deleteStudentData('est-1');

    expect(await getProfile('est-1')).toBeUndefined();
    expect(await getProgressByStudent('est-1')).toHaveLength(0);
    expect(await getGamification('est-1')).toBeUndefined();
    expect(await getReviewByStudent('est-1')).toHaveLength(0);
    expect(await getSyncQueueByStudent('est-1')).toHaveLength(0);
  });

  it('no afecta a otro estudiante', async () => {
    await seedStudent({
      id: 'est-1',
      apodo: 'Explorador',
      codigoClase: 'ABC123',
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });
    await seedStudent({
      id: 'est-2',
      apodo: 'Curiosa',
      codigoClase: 'ABC123',
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });

    await deleteStudentData('est-1');

    expect(await getProfile('est-2')).toBeDefined();
    expect(await getProgressByStudent('est-2')).toHaveLength(1);
    expect(await getSyncQueueByStudent('est-2')).toHaveLength(1);
  });
});

describe('deleteClassData', () => {
  it('borra la clase y todos sus estudiantes', async () => {
    await putClass({
      id: 'clase-1',
      codigo: 'ABC123',
      unidadesActivas: ['u6-convivencia'],
      docentePinHash: 'hash-ficticio',
    });
    await seedStudent({
      id: 'est-1',
      apodo: 'Explorador',
      codigoClase: 'ABC123',
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });
    await seedStudent({
      id: 'est-2',
      apodo: 'Curiosa',
      codigoClase: 'ABC123',
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });

    await deleteClassData('clase-1');

    expect(await getClass('clase-1')).toBeUndefined();
    expect(await getAllProfiles()).toHaveLength(0);
    expect(await getProfile('est-1')).toBeUndefined();
    expect(await getProfile('est-2')).toBeUndefined();
    expect(await getProgressByStudent('est-1')).toHaveLength(0);
    expect(await getProgressByStudent('est-2')).toHaveLength(0);
  });

  it('no lanza si la clase no existe', async () => {
    await expect(deleteClassData('inexistente')).resolves.toBeUndefined();
  });
});
