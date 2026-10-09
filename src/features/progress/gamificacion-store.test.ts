import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Curso, Leccion, Unidad } from '../../content';
import { closeDb, getGamification, putProgress, resetDb, type Progreso } from '../../lib/storage';
import type { ResumenLeccion } from '../lessons/answers';
import { logroUnidadCompletada } from './logros';
import {
  obtenerAvanceEjePaz,
  obtenerGamificacion,
  registrarLeccionCompletada,
} from './gamificacion-store';

/**
 * Pruebas del wrapper de persistencia de gamificación (tarea 10.4) con
 * `fake-indexeddb`: se recrea la BD por prueba (patrón de `leccion-progreso.test.ts`).
 * Determinismo: `hoy` siempre inyectado.
 */

const ESTUDIANTE = 'est-1';

function leccion(id: string, orden: number): Leccion {
  return {
    id,
    titulo: `Lección ${id}`,
    objetivoAprendizaje: 'Objetivo',
    competencia: 'Competencia',
    orden,
    ejercicios: [],
  };
}

function unidad(id: string, orden: number, ejePaz: boolean, lecciones: Leccion[]): Unidad {
  return {
    id,
    titulo: `Unidad ${id}`,
    descripcion: `Descripción ${id}`,
    orden,
    objetivos: [],
    ejePaz,
    catedraPaz: { tematicas: ['Convivencia'], como: 'Transversal' },
    lecciones,
  };
}

function curso(unidades: Unidad[]): Curso {
  return {
    id: 'curso-prueba',
    grado: 6,
    area: 'ciencias_sociales',
    titulo: 'Curso de prueba',
    descripcion: 'Descripción',
    version: '1.0.0',
    unidades,
  };
}

const CURSO = curso([
  unidad('u1', 1, true, [leccion('l1', 1), leccion('l2', 2)]),
  unidad('u2', 2, false, [leccion('l3', 1)]),
]);

function resumen(leccionId: string, aciertosPrimerIntento: number): ResumenLeccion {
  return {
    leccionId,
    totalEvaluables: aciertosPrimerIntento,
    aciertos: aciertosPrimerIntento,
    aciertosPrimerIntento,
    omitidos: [],
  };
}

function progresoCompletado(leccionId: string): Progreso {
  return {
    id: `prog-${leccionId}`,
    estudianteId: ESTUDIANTE,
    leccionId,
    estado: 'completada',
    aciertos: 1,
    completadaEn: '2024-05-01T00:00:00.000Z',
  };
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('obtenerGamificacion', () => {
  it('inicializa la gamificación si el estudiante no tiene registro', async () => {
    const g = await obtenerGamificacion(ESTUDIANTE);
    expect(g).toEqual({
      estudianteId: ESTUDIANTE,
      xp: 0,
      rachaActual: 0,
      mejorRacha: 0,
      ultimaFechaActiva: '',
      logros: [],
    });
  });
});

describe('registrarLeccionCompletada', () => {
  it('suma XP, aplica la racha y persiste', async () => {
    const res = await registrarLeccionCompletada({
      estudianteId: ESTUDIANTE,
      resumen: resumen('l1', 2),
      curso: CURSO,
      unidadesCompletadas: [],
      hoy: '2024-05-01',
    });

    expect(res.xpGanada).toBe(14); // 10 + 2*2
    expect(res.gamificacion.xp).toBe(14);
    expect(res.gamificacion.rachaActual).toBe(1);

    const guardada = await getGamification(ESTUDIANTE);
    expect(guardada?.xp).toBe(14);
    expect(guardada?.ultimaFechaActiva).toBe('2024-05-01');
  });

  it('en el mismo día no incrementa la racha pero sí acumula XP', async () => {
    await registrarLeccionCompletada({
      estudianteId: ESTUDIANTE,
      resumen: resumen('l1', 0),
      curso: CURSO,
      unidadesCompletadas: [],
      hoy: '2024-05-01',
    });
    const segunda = await registrarLeccionCompletada({
      estudianteId: ESTUDIANTE,
      resumen: resumen('l2', 0),
      curso: CURSO,
      unidadesCompletadas: [],
      hoy: '2024-05-01',
    });

    expect(segunda.gamificacion.rachaActual).toBe(1);
    expect(segunda.gamificacion.xp).toBe(20); // 10 + 10
  });

  it('otorga logros de unidad sin duplicar entre llamadas', async () => {
    const primera = await registrarLeccionCompletada({
      estudianteId: ESTUDIANTE,
      resumen: resumen('l1', 0),
      curso: CURSO,
      unidadesCompletadas: ['u1'],
      hoy: '2024-05-01',
    });
    const idLogro = logroUnidadCompletada(CURSO.unidades[0]).id;
    expect(primera.logrosNuevos).toContain(idLogro);

    const segunda = await registrarLeccionCompletada({
      estudianteId: ESTUDIANTE,
      resumen: resumen('l2', 0),
      curso: CURSO,
      unidadesCompletadas: ['u1'],
      hoy: '2024-05-01',
    });
    expect(segunda.logrosNuevos).not.toContain(idLogro);

    const guardada = await getGamification(ESTUDIANTE);
    const ocurrencias = guardada?.logros.filter((l) => l === idLogro).length;
    expect(ocurrencias).toBe(1);
  });
});

describe('obtenerAvanceEjePaz', () => {
  it('combina el progreso real con el curso (solo unidades ejePaz)', async () => {
    // l1 (eje Paz) completada; l3 (no paz) completada e ignorada.
    await putProgress(progresoCompletado('l1'));
    await putProgress(progresoCompletado('l3'));

    const avance = await obtenerAvanceEjePaz(ESTUDIANTE, CURSO);
    expect(avance.total).toBe(2); // l1 y l2 (unidad u1 ejePaz)
    expect(avance.completadas).toBe(1);
    expect(avance.porcentaje).toBe(50);
  });
});
