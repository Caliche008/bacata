import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  closeDb,
  getProfile,
  getProgressByStudent,
  putProfile,
  putProgress,
  resetDb,
  type PerfilEstudiante,
} from '../../lib/storage';
import {
  MENSAJE_APODO_DUPLICADO,
  MENSAJE_APODO_OFENSIVO,
  eliminarEstudiante,
  renombrarApodo,
} from './students-service';

/** Pruebas de renombrar/eliminar perfiles (R6.6, R8.3). */

const CODIGO = 'ABC234';

async function sembrar(id: string, apodo: string): Promise<void> {
  const perfil: PerfilEstudiante = {
    id,
    apodo,
    codigoClase: CODIGO,
    grado: 6,
    creadoEn: new Date().toISOString(),
  };
  await putProfile(perfil);
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('renombrarApodo (R6.6)', () => {
  it('cambia el apodo con un valor válido', async () => {
    await sembrar('est-1', 'Explorador');
    const resultado = await renombrarApodo('est-1', 'Curioso');
    expect(resultado.ok).toBe(true);
    expect((await getProfile('est-1'))?.apodo).toBe('Curioso');
  });

  it('rechaza un apodo ofensivo', async () => {
    await sembrar('est-1', 'Explorador');
    const resultado = await renombrarApodo('est-1', 'tonto');
    expect(resultado.ok).toBe(false);
    expect(resultado.error).toBe(MENSAJE_APODO_OFENSIVO);
    expect((await getProfile('est-1'))?.apodo).toBe('Explorador');
  });

  it('rechaza un apodo duplicado en la misma clase', async () => {
    await sembrar('est-1', 'Explorador');
    await sembrar('est-2', 'Curiosa');
    const resultado = await renombrarApodo('est-2', 'explorador');
    expect(resultado.ok).toBe(false);
    expect(resultado.error).toBe(MENSAJE_APODO_DUPLICADO);
  });

  it('permite conservar el mismo apodo (no se considera duplicado de sí mismo)', async () => {
    await sembrar('est-1', 'Explorador');
    const resultado = await renombrarApodo('est-1', 'Explorador');
    expect(resultado.ok).toBe(true);
  });
});

describe('eliminarEstudiante (R6.6, R8.3)', () => {
  it('borra el perfil y su progreso por completo', async () => {
    await sembrar('est-1', 'Explorador');
    await putProgress({
      id: 'est-1:l1',
      estudianteId: 'est-1',
      leccionId: 'l1',
      estado: 'completada',
      aciertos: 1,
      completadaEn: new Date().toISOString(),
    });

    await eliminarEstudiante('est-1');

    expect(await getProfile('est-1')).toBeUndefined();
    expect(await getProgressByStudent('est-1')).toHaveLength(0);
  });
});
