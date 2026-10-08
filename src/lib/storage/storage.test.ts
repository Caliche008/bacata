import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Curso } from '../../content/types';
import { closeDb, resetDb } from './db';
import {
  deleteProfile,
  getAllProfiles,
  getProfile,
  getProfilesByClassCode,
  putProfile,
} from './profiles';
import {
  deleteProgress,
  getProgress,
  getProgressByStudent,
  getProgressForLesson,
  putProgress,
} from './progress';
import { deleteGamification, getGamification, putGamification } from './gamification';
import {
  deleteReview,
  getReview,
  getReviewByStudent,
  putReview,
  reviewId,
} from './review';
import {
  deleteCachedCourse,
  getAllCachedCourses,
  getCachedCourse,
  putCachedCourse,
} from './contentCache';
import {
  deleteClass,
  getAllClasses,
  getClass,
  getClassByCode,
  putClass,
} from './classes';
import {
  clearSyncQueue,
  deleteSyncEvent,
  enqueueSyncEvent,
  getSyncQueue,
  getSyncQueueByStudent,
} from './syncQueue';

/**
 * Pruebas de la capa de almacenamiento con `fake-indexeddb` (jsdom no trae
 * IndexedDB). Cada prueba corre sobre una BD limpia: se recrea la `IDBFactory`
 * y se reinicia la promesa memoizada en `beforeEach`.
 */

const seedCurso = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'cursos', 'grado-6.json'), 'utf8'),
) as Curso;

beforeEach(async () => {
  await closeDb();
  // Recrea una fábrica de IndexedDB en memoria para aislar el estado.
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('perfilEstudiante — CRUD e índice', () => {
  it('escribe, lee, lista y borra sin PII', async () => {
    await putProfile({
      id: 'est-1',
      apodo: 'Explorador',
      codigoClase: 'ABC123',
      grado: 6,
      creadoEn: '2024-01-01T00:00:00.000Z',
    });

    const leido = await getProfile('est-1');
    expect(leido?.apodo).toBe('Explorador');

    expect(await getAllProfiles()).toHaveLength(1);
    expect(await getProfilesByClassCode('ABC123')).toHaveLength(1);
    expect(await getProfilesByClassCode('OTRO')).toHaveLength(0);

    await deleteProfile('est-1');
    expect(await getProfile('est-1')).toBeUndefined();
  });
});

describe('progreso — CRUD e índices', () => {
  it('consulta por estudiante y por lección', async () => {
    await putProgress({
      id: 'prog-1',
      estudianteId: 'est-1',
      leccionId: 'l6-conv-1',
      estado: 'completada',
      aciertos: 3,
      completadaEn: '2024-01-02T00:00:00.000Z',
    });

    expect(await getProgress('prog-1')).toBeDefined();
    expect(await getProgressByStudent('est-1')).toHaveLength(1);

    const porLeccion = await getProgressForLesson('est-1', 'l6-conv-1');
    expect(porLeccion?.id).toBe('prog-1');

    await deleteProgress('prog-1');
    expect(await getProgress('prog-1')).toBeUndefined();
  });
});

describe('gamificacion — CRUD', () => {
  it('escribe y lee por estudiante', async () => {
    await putGamification({
      estudianteId: 'est-1',
      xp: 42,
      rachaActual: 3,
      mejorRacha: 5,
      ultimaFechaActiva: '2024-01-02',
      logros: ['unidad-convivencia'],
    });

    const g = await getGamification('est-1');
    expect(g?.xp).toBe(42);
    expect(g?.logros).toContain('unidad-convivencia');

    await deleteGamification('est-1');
    expect(await getGamification('est-1')).toBeUndefined();
  });
});

describe('repaso — CRUD por pareja (estudiante, ejercicio)', () => {
  it('usa id sintético y el índice por estudiante', async () => {
    await putReview({
      id: reviewId('est-1', 'ej-9'),
      estudianteId: 'est-1',
      ejercicioId: 'ej-9',
      fallos: 2,
      proximaAparicion: 1_700_000_000_000,
    });

    const r = await getReview('est-1', 'ej-9');
    expect(r?.fallos).toBe(2);
    expect(await getReviewByStudent('est-1')).toHaveLength(1);

    await deleteReview('est-1', 'ej-9');
    expect(await getReview('est-1', 'ej-9')).toBeUndefined();
  });
});

describe('contenidoCache — por grado', () => {
  it('guarda el curso semilla y lo recupera', async () => {
    await putCachedCourse(6, seedCurso.version, seedCurso);

    const cache = await getCachedCourse(6);
    expect(cache?.version).toBe(seedCurso.version);
    expect(cache?.curso.id).toBe(seedCurso.id);
    expect(await getAllCachedCourses()).toHaveLength(1);

    await deleteCachedCourse(6);
    expect(await getCachedCourse(6)).toBeUndefined();
  });
});

describe('clasesLocales — CRUD e índice por código', () => {
  it('escribe, consulta por código y borra', async () => {
    await putClass({
      id: 'clase-1',
      codigo: 'ABC123',
      unidadesActivas: ['u6-convivencia'],
      docentePinHash: 'hash-ficticio',
    });

    expect(await getClass('clase-1')).toBeDefined();
    const porCodigo = await getClassByCode('ABC123');
    expect(porCodigo?.id).toBe('clase-1');
    expect(await getAllClasses()).toHaveLength(1);

    await deleteClass('clase-1');
    expect(await getClass('clase-1')).toBeUndefined();
  });
});

describe('colaSync — almacenamiento e idempotencia', () => {
  it('genera un id cuando no se provee', async () => {
    const id = await enqueueSyncEvent({
      estudianteId: 'est-1',
      tipo: 'progreso',
      payload: { leccionId: 'l6-conv-1' },
      creadoEn: '2024-01-02T00:00:00.000Z',
    });

    expect(id).toBeTruthy();
    expect(await getSyncQueue()).toHaveLength(1);
    expect(await getSyncQueueByStudent('est-1')).toHaveLength(1);
  });

  it('reencolar con el mismo id reemplaza, no duplica (idempotencia)', async () => {
    const base = {
      id: 'evt-fijo',
      estudianteId: 'est-1',
      tipo: 'progreso',
      payload: { intento: 1 },
      creadoEn: '2024-01-02T00:00:00.000Z',
    };

    await enqueueSyncEvent(base);
    await enqueueSyncEvent({ ...base, payload: { intento: 2 } });

    const cola = await getSyncQueue();
    expect(cola).toHaveLength(1);
    expect(cola[0].payload).toEqual({ intento: 2 });

    await deleteSyncEvent('evt-fijo');
    expect(await getSyncQueue()).toHaveLength(0);
  });

  it('clearSyncQueue vacía la cola', async () => {
    await enqueueSyncEvent({
      estudianteId: 'est-1',
      tipo: 'progreso',
      payload: {},
      creadoEn: '2024-01-02T00:00:00.000Z',
    });
    await clearSyncQueue();
    expect(await getSyncQueue()).toHaveLength(0);
  });
});
