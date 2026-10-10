import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  closeDb,
  getClass,
  getClassByCode,
  resetDb,
} from '../../lib/storage';
import { isValidClassCode } from '../auth';
import { getClassGrade } from '../../lib/preferences';
import {
  crearClase,
  listarClases,
  regenerarCodigo,
  setUnidadesActivas,
} from './classes-service';

/**
 * Pruebas de la gestión de clases del docente (R6.1, R6.7) con `fake-indexeddb`.
 * Se recrea la BD por prueba, como en `storage.test.ts`.
 */

const PIN_HASH = 'salt:hash';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
  window.localStorage.clear();
});

afterEach(async () => {
  await closeDb();
  window.localStorage.clear();
});

describe('crearClase (R6.1)', () => {
  it('genera un código válido y persiste la clase', async () => {
    const clase = await crearClase({
      grado: 6,
      idsUnidadesActivas: ['u6-conv', 'u6-ddhh'],
      pinHash: PIN_HASH,
    });

    expect(isValidClassCode(clase.codigo)).toBe(true);
    expect(clase.unidadesActivas).toEqual(['u6-conv', 'u6-ddhh']);

    const persistida = await getClassByCode(clase.codigo);
    expect(persistida?.id).toBe(clase.id);
    expect(getClassGrade(clase.id)).toBe(6);
  });

  it('dos clases no colisionan de código', async () => {
    const a = await crearClase({ grado: 6, idsUnidadesActivas: [], pinHash: PIN_HASH });
    const b = await crearClase({ grado: 7, idsUnidadesActivas: [], pinHash: PIN_HASH });
    expect(a.codigo).not.toBe(b.codigo);
    expect(await listarClases()).toHaveLength(2);
  });
});

describe('regenerarCodigo (R6.7)', () => {
  it('cambia el código y el anterior deja de resolver', async () => {
    const clase = await crearClase({ grado: 6, idsUnidadesActivas: [], pinHash: PIN_HASH });
    const codigoViejo = clase.codigo;

    const actualizada = await regenerarCodigo(clase.id);
    expect(actualizada.codigo).not.toBe(codigoViejo);
    expect(isValidClassCode(actualizada.codigo)).toBe(true);

    expect(await getClassByCode(codigoViejo)).toBeUndefined();
    expect(await getClassByCode(actualizada.codigo)).toBeDefined();
  });

  it('lanza si la clase no existe', async () => {
    await expect(regenerarCodigo('inexistente')).rejects.toThrow();
  });
});

describe('setUnidadesActivas (R6.3/R6.4)', () => {
  it('persiste la lista exacta de ids a mostrar', async () => {
    const clase = await crearClase({
      grado: 6,
      idsUnidadesActivas: ['u1', 'u2', 'u3'],
      pinHash: PIN_HASH,
    });

    await setUnidadesActivas(clase.id, ['u1', 'u3']);
    const persistida = await getClass(clase.id);
    expect(persistida?.unidadesActivas).toEqual(['u1', 'u3']);
  });
});
