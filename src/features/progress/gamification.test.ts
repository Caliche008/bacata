import { describe, expect, it } from 'vitest';
import type { Curso, Leccion, Unidad } from '../../content';
import type { ResumenLeccion } from '../lessons/answers';
import {
  calcularAvanceEjePaz,
  calcularRacha,
  calcularXpLeccion,
  diferenciaEnDias,
  type RachaPrevia,
} from './gamification';

/**
 * Pruebas de las reglas PURAS de gamificación (tarea 10.4). Fijan la fórmula de
 * XP y la política de racha de `design.md`. Deterministas: la fecha "hoy" se
 * inyecta siempre como `YYYY-MM-DD`.
 */

function resumen(aciertosPrimerIntento: number, aciertos = aciertosPrimerIntento): ResumenLeccion {
  return {
    leccionId: 'l1',
    totalEvaluables: aciertos,
    aciertos,
    aciertosPrimerIntento,
    omitidos: [],
  };
}

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

describe('calcularXpLeccion (R4.1)', () => {
  it('sin aciertos en primer intento otorga solo los 10 de completar', () => {
    expect(calcularXpLeccion(resumen(0))).toBe(10);
  });

  it('otorga 10 + 2 por cada acierto en primer intento', () => {
    expect(calcularXpLeccion(resumen(1))).toBe(12);
    expect(calcularXpLeccion(resumen(3))).toBe(16);
    expect(calcularXpLeccion(resumen(5))).toBe(20);
  });

  it('reintentos y fallos no suman ni restan (solo cuenta el primer intento)', () => {
    // 5 evaluables, 4 acertados en total pero solo 2 en primer intento.
    const r: ResumenLeccion = {
      leccionId: 'l1',
      totalEvaluables: 5,
      aciertos: 4,
      aciertosPrimerIntento: 2,
      omitidos: [],
    };
    expect(calcularXpLeccion(r)).toBe(14);
  });
});

describe('diferenciaEnDias', () => {
  it('cuenta días calendario completos', () => {
    expect(diferenciaEnDias('2024-03-10', '2024-03-11')).toBe(1);
    expect(diferenciaEnDias('2024-03-10', '2024-03-10')).toBe(0);
    expect(diferenciaEnDias('2024-03-11', '2024-03-10')).toBe(-1);
  });

  it('cruza el cambio de año como un solo día', () => {
    expect(diferenciaEnDias('2024-12-31', '2025-01-01')).toBe(1);
  });
});

describe('calcularRacha (R4.2, R4.7)', () => {
  const previo = (
    rachaActual: number,
    ultimaFechaActiva: string,
    mejorRacha = rachaActual,
  ): RachaPrevia => ({ rachaActual, mejorRacha, ultimaFechaActiva });

  it('primer día (sin previo) arranca la racha en 1', () => {
    const r = calcularRacha(undefined, '2024-05-01');
    expect(r.rachaActual).toBe(1);
    expect(r.mejorRacha).toBe(1);
    expect(r.ultimaFechaActiva).toBe('2024-05-01');
    expect(r.reinicioRacha).toBe(false);
  });

  it('mismo día mantiene la racha sin incrementar', () => {
    const r = calcularRacha(previo(3, '2024-05-01'), '2024-05-01');
    expect(r.rachaActual).toBe(3);
    expect(r.incremento).toBe(false);
    expect(r.ultimaFechaActiva).toBe('2024-05-01');
  });

  it('día siguiente incrementa en 1', () => {
    const r = calcularRacha(previo(3, '2024-05-01'), '2024-05-02');
    expect(r.rachaActual).toBe(4);
    expect(r.incremento).toBe(true);
    expect(r.reinicioRacha).toBe(false);
    expect(r.ultimaFechaActiva).toBe('2024-05-02');
  });

  it('salto de más de un día reinicia a 1 con reinicioRacha', () => {
    const r = calcularRacha(previo(6, '2024-05-01'), '2024-05-05');
    expect(r.rachaActual).toBe(1);
    expect(r.reinicioRacha).toBe(true);
    expect(r.ultimaFechaActiva).toBe('2024-05-05');
  });

  it('reloj hacia atrás se ignora (no cambia racha ni fecha)', () => {
    const r = calcularRacha(previo(4, '2024-05-10'), '2024-05-08');
    expect(r.rachaActual).toBe(4);
    expect(r.reinicioRacha).toBe(false);
    expect(r.incremento).toBe(false);
    expect(r.ultimaFechaActiva).toBe('2024-05-10');
  });

  it('mejorRacha guarda el máximo histórico', () => {
    // Venía de mejorRacha 10; aunque hoy reinicie, se conserva el máximo.
    const r = calcularRacha(previo(6, '2024-05-01', 10), '2024-05-05');
    expect(r.rachaActual).toBe(1);
    expect(r.mejorRacha).toBe(10);
  });

  it('cruce de año cuenta como día siguiente', () => {
    const r = calcularRacha(previo(2, '2024-12-31'), '2025-01-01');
    expect(r.rachaActual).toBe(3);
    expect(r.reinicioRacha).toBe(false);
  });
});

describe('calcularAvanceEjePaz (R12.5)', () => {
  const cursoPaz = () =>
    curso([
      unidad('u1', 1, true, [leccion('l1', 1), leccion('l2', 2)]),
      unidad('u2', 2, false, [leccion('l3', 1)]),
      unidad('u3', 3, true, [leccion('l4', 1), leccion('l5', 2)]),
    ]);

  it('sin lecciones de eje Paz devuelve 0 % sin dividir por cero', () => {
    const cursoSinPaz = curso([unidad('u1', 1, false, [leccion('l1', 1)])]);
    expect(calcularAvanceEjePaz(cursoSinPaz, new Set())).toEqual({
      porcentaje: 0,
      completadas: 0,
      total: 0,
    });
  });

  it('calcula avance parcial redondeado solo sobre unidades ejePaz', () => {
    // 4 lecciones de eje Paz (u1 + u3); 1 completada y una de u2 (no paz) ignorada.
    const avance = calcularAvanceEjePaz(cursoPaz(), new Set(['l1', 'l3']));
    expect(avance.total).toBe(4);
    expect(avance.completadas).toBe(1);
    expect(avance.porcentaje).toBe(25);
  });

  it('reporta 100 % cuando todas las lecciones de eje Paz están completadas', () => {
    const avance = calcularAvanceEjePaz(cursoPaz(), new Set(['l1', 'l2', 'l4', 'l5']));
    expect(avance).toEqual({ porcentaje: 100, completadas: 4, total: 4 });
  });

  it('redondea porcentajes no exactos', () => {
    // 1 de 3 lecciones de eje Paz = 33.33 % -> 33.
    const c = curso([unidad('u1', 1, true, [leccion('l1', 1), leccion('l2', 2), leccion('l3', 3)])]);
    expect(calcularAvanceEjePaz(c, new Set(['l1'])).porcentaje).toBe(33);
  });
});
