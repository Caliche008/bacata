import { describe, expect, it } from 'vitest';
import type { Curso, Unidad } from '../../content';
import { LOGRO_RACHA_7, evaluarLogros, logroUnidadCompletada } from './logros';

/**
 * Pruebas de los LOGROS (tarea 10.4): se otorga la racha de 7 días al llegar a 7
 * (no antes), se otorga un logro por cada unidad completada, no se re-otorgan los
 * ya presentes y el catálogo es extensible por datos. Lógica pura.
 */

function unidad(id: string, orden: number): Unidad {
  return {
    id,
    titulo: `Unidad ${id}`,
    descripcion: `Descripción ${id}`,
    orden,
    objetivos: [],
    ejePaz: true,
    catedraPaz: { tematicas: ['Convivencia'], como: 'Transversal' },
    lecciones: [],
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

const CURSO = curso([unidad('u1', 1), unidad('u2', 2), unidad('u3', 3)]);

describe('evaluarLogros — racha de 7 días (R4.3)', () => {
  it('no otorga el logro antes de los 7 días', () => {
    const nuevos = evaluarLogros({
      rachaActual: 6,
      unidadesCompletadas: [],
      logrosActuales: [],
      curso: CURSO,
    });
    expect(nuevos).not.toContain(LOGRO_RACHA_7);
  });

  it('otorga el logro al alcanzar 7 días', () => {
    const nuevos = evaluarLogros({
      rachaActual: 7,
      unidadesCompletadas: [],
      logrosActuales: [],
      curso: CURSO,
    });
    expect(nuevos).toContain(LOGRO_RACHA_7);
  });

  it('no re-otorga la racha de 7 si ya está presente', () => {
    const nuevos = evaluarLogros({
      rachaActual: 10,
      unidadesCompletadas: [],
      logrosActuales: [LOGRO_RACHA_7],
      curso: CURSO,
    });
    expect(nuevos).not.toContain(LOGRO_RACHA_7);
  });
});

describe('evaluarLogros — unidades completadas', () => {
  it('otorga un logro por cada unidad completada', () => {
    const nuevos = evaluarLogros({
      rachaActual: 1,
      unidadesCompletadas: ['u1', 'u3'],
      logrosActuales: [],
      curso: CURSO,
    });
    expect(nuevos).toContain(logroUnidadCompletada(unidad('u1', 1)).id);
    expect(nuevos).toContain(logroUnidadCompletada(unidad('u3', 3)).id);
    expect(nuevos).not.toContain(logroUnidadCompletada(unidad('u2', 2)).id);
  });

  it('no re-otorga logros de unidad ya presentes', () => {
    const yaOtorgado = logroUnidadCompletada(unidad('u1', 1)).id;
    const nuevos = evaluarLogros({
      rachaActual: 1,
      unidadesCompletadas: ['u1', 'u2'],
      logrosActuales: [yaOtorgado],
      curso: CURSO,
    });
    expect(nuevos).not.toContain(yaOtorgado);
    expect(nuevos).toContain(logroUnidadCompletada(unidad('u2', 2)).id);
  });

  it('el id de un logro de unidad es estable y extensible por datos', () => {
    expect(logroUnidadCompletada(unidad('u9', 9)).id).toBe('unidad-completada:u9');
  });
});
