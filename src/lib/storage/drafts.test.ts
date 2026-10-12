import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Curso } from '../../content/types';
import { closeDb, resetDb } from './db';
import {
  deleteDraft,
  getAllDrafts,
  getDraft,
  getDraftsByGrade,
  putDraft,
} from './drafts';

/**
 * Pruebas del store `borradoresContenido` con `fake-indexeddb`. Mismo patrón
 * que `storage.test.ts`: BD limpia por prueba recreando la `IDBFactory`.
 */

const seedCurso = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'cursos', 'grado-6.json'), 'utf8'),
) as Curso;

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('borradoresContenido — CRUD e índice por grado', () => {
  it('escribe, lee, lista, consulta por grado y borra', async () => {
    await putDraft({
      id: 'borrador-6',
      grado: 6,
      curso: seedCurso,
      actualizadoEn: '2024-01-01T00:00:00.000Z',
    });
    await putDraft({
      id: 'borrador-7',
      grado: 7,
      curso: { ...seedCurso, grado: 7 },
      actualizadoEn: '2024-01-02T00:00:00.000Z',
    });

    const leido = await getDraft('borrador-6');
    expect(leido?.grado).toBe(6);
    expect(leido?.curso.id).toBe(seedCurso.id);

    expect(await getAllDrafts()).toHaveLength(2);

    const porGrado6 = await getDraftsByGrade(6);
    expect(porGrado6).toHaveLength(1);
    expect(porGrado6[0].id).toBe('borrador-6');
    expect(await getDraftsByGrade(8)).toHaveLength(0);

    await deleteDraft('borrador-6');
    expect(await getDraft('borrador-6')).toBeUndefined();
    expect(await getAllDrafts()).toHaveLength(1);
  });

  it('guarda un borrador incompleto sin validar ni filtrar', async () => {
    const incompleto = { id: 'wip', titulo: 'En construcción' } as unknown as Curso;
    await putDraft({
      id: 'borrador-wip',
      grado: 8,
      curso: incompleto,
      actualizadoEn: '2024-01-03T00:00:00.000Z',
    });

    const leido = await getDraft('borrador-wip');
    expect(leido?.curso).toEqual(incompleto);
  });
});
