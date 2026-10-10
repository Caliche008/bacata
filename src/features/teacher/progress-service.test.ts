import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadBundledCourses } from '../../content/loader';
import { getCursoPorGrado, listarLecciones, listarUnidades } from '../../content';
import type { Curso } from '../../content';
import {
  closeDb,
  putProfile,
  putProgress,
  resetDb,
  type PerfilEstudiante,
} from '../../lib/storage';
import { resumenClase } from './progress-service';

/**
 * Pruebas del resumen de progreso por clase (R6.2). Usa el contenido semilla
 * real de 6° y comprueba que el resumen muestra apodo + porcentaje por unidad y
 * que NUNCA incluye PII ni el hash docente.
 */

const CODIGO = 'ABC234';

function cursoDe6(): Curso {
  const { index } = loadBundledCourses();
  const curso = getCursoPorGrado(index, 6);
  if (!curso) {
    throw new Error('No se encontró el curso de 6° en el contenido semilla.');
  }
  return curso;
}

async function sembrarEstudiante(
  id: string,
  apodo: string,
  leccionesCompletadas: string[],
): Promise<void> {
  const perfil: PerfilEstudiante = {
    id,
    apodo,
    codigoClase: CODIGO,
    grado: 6,
    creadoEn: new Date().toISOString(),
  };
  await putProfile(perfil);
  for (const leccionId of leccionesCompletadas) {
    await putProgress({
      id: `${id}:${leccionId}`,
      estudianteId: id,
      leccionId,
      estado: 'completada',
      aciertos: 1,
      completadaEn: new Date().toISOString(),
    });
  }
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('resumenClase (R6.2)', () => {
  it('muestra el apodo y el avance por unidad de cada estudiante', async () => {
    const curso = cursoDe6();
    const primeraUnidad = listarUnidades(curso)[0];
    const primeraLeccion = listarLecciones(primeraUnidad)[0];

    await sembrarEstudiante('est-1', 'Explorador', [primeraLeccion.id]);
    await sembrarEstudiante('est-2', 'Curiosa', []);

    const resumen = await resumenClase(CODIGO, curso);
    expect(resumen).toHaveLength(2);

    const explorador = resumen.find((r) => r.apodo === 'Explorador');
    expect(explorador).toBeDefined();
    const avanceU1 = explorador?.porUnidad.find((u) => u.unidadId === primeraUnidad.id);
    expect(avanceU1?.completadas).toBe(1);
    expect(avanceU1?.porcentaje).toBeGreaterThan(0);

    const curiosa = resumen.find((r) => r.apodo === 'Curiosa');
    expect(curiosa?.leccionesCompletadas).toBe(0);
  });

  it('el resumen NO contiene PII ni el hash docente', async () => {
    const curso = cursoDe6();
    await sembrarEstudiante('est-1', 'Explorador', []);

    const resumen = await resumenClase(CODIGO, curso);
    const serializado = JSON.stringify(resumen);

    expect(serializado).not.toContain('docentePinHash');
    expect(serializado).not.toContain('codigoClase');
    expect(serializado).not.toContain('creadoEn');

    const claves = Object.keys(resumen[0]).sort();
    expect(claves).toEqual([
      'apodo',
      'estudianteId',
      'leccionesCompletadas',
      'porUnidad',
      'totalLecciones',
    ]);
  });

  it('marca el eje de la Cátedra de la Paz por unidad', async () => {
    const curso = cursoDe6();
    await sembrarEstudiante('est-1', 'Explorador', []);
    const resumen = await resumenClase(CODIGO, curso);
    // El contenido declara al menos una unidad con la Cátedra de la Paz como eje.
    expect(resumen[0].porUnidad.some((u) => u.ejePaz)).toBe(true);
  });
});
