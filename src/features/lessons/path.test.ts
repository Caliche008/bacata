import { describe, expect, it } from 'vitest';
import type { Curso, Leccion, Unidad } from '../../content';
import type { Progreso } from '../../lib/storage';
import {
  construirRuta,
  leccionesCompletadas,
  porcentajeUnidad,
  unidadesActivasOrdenadas,
} from './path';

/**
 * Pruebas de la lógica PURA de la ruta (casos a–f del brief). Construyen un
 * `Curso` mínimo tipado en el propio test (no dependen de la semilla real),
 * para fijar el contrato de desbloqueo/porcentaje sin montar componentes.
 */

/** Lección mínima: solo los campos que lee la lógica + los exigidos por el tipo. */
function leccion(id: string, orden: number): Leccion {
  return {
    id,
    titulo: `Lección ${id}`,
    objetivoAprendizaje: 'Objetivo de prueba',
    competencia: 'Competencia de prueba',
    orden,
    ejercicios: [],
  };
}

function unidad(id: string, orden: number, lecciones: Leccion[]): Unidad {
  return {
    id,
    titulo: `Unidad ${id}`,
    descripcion: `Descripción ${id}`,
    orden,
    objetivos: [],
    ejePaz: true,
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
    descripcion: 'Descripción del curso',
    version: '1.0.0',
    unidades,
  };
}

function completada(leccionId: string): Progreso {
  return {
    id: `prog-${leccionId}`,
    estudianteId: 'est-1',
    leccionId,
    estado: 'completada',
    aciertos: 1,
    completadaEn: '2024-01-01T00:00:00.000Z',
  };
}

/** Curso de prueba: U1 (2 lecciones), U2 vacía, U3 (1 lección). Orden desordenado a propósito. */
function cursoBase(): Curso {
  return curso([
    unidad('u3', 3, [leccion('l3a', 1)]),
    unidad('u1', 1, [leccion('l1b', 2), leccion('l1a', 1)]),
    unidad('u2', 2, []),
  ]);
}

describe('path — orden (a)', () => {
  it('ordena unidades y lecciones por `orden`', () => {
    const ruta = construirRuta(cursoBase(), null, []);
    expect(ruta.unidades.map((u) => u.id)).toEqual(['u1', 'u2', 'u3']);
    expect(ruta.unidades[0].lecciones.map((l) => l.id)).toEqual(['l1a', 'l1b']);
  });
});

describe('path — desbloqueo inicial (b)', () => {
  it('la primera lección está disponible y el resto bloqueado al inicio', () => {
    const ruta = construirRuta(cursoBase(), null, []);
    const [u1, , u3] = ruta.unidades;
    expect(u1.lecciones[0].estado).toBe('disponible');
    expect(u1.lecciones[1].estado).toBe('bloqueada');
    expect(u3.lecciones[0].estado).toBe('bloqueada');
  });

  it('completar una lección desbloquea la siguiente por `orden`', () => {
    const ruta = construirRuta(cursoBase(), null, [completada('l1a')]);
    const u1 = ruta.unidades[0];
    expect(u1.lecciones[0].estado).toBe('completada');
    expect(u1.lecciones[1].estado).toBe('disponible');
  });
});

describe('path — salto entre unidades omitiendo vacías (c)', () => {
  it('completar la última lección de una unidad habilita la primera de la siguiente unidad con lecciones', () => {
    // Completadas l1a y l1b (toda la U1). U2 está vacía: se omite. Debe habilitar l3a de U3.
    const ruta = construirRuta(cursoBase(), null, [completada('l1a'), completada('l1b')]);
    const [u1, u2, u3] = ruta.unidades;
    expect(u1.completada).toBe(true);
    expect(u2.vacia).toBe(true);
    expect(u3.lecciones[0].estado).toBe('disponible');
  });
});

describe('path — estados derivados del progreso (d)', () => {
  it('mapea bloqueada/disponible/completada según el store', () => {
    const ruta = construirRuta(cursoBase(), null, [completada('l1a')]);
    const estados = ruta.unidades.flatMap((u) => u.lecciones.map((l) => [l.id, l.estado]));
    expect(estados).toEqual([
      ['l1a', 'completada'],
      ['l1b', 'disponible'],
      ['l3a', 'bloqueada'],
    ]);
  });

  it('leccionesCompletadas ignora el estado en_progreso', () => {
    const enProgreso: Progreso = {
      id: 'p',
      estudianteId: 'est-1',
      leccionId: 'l1a',
      estado: 'en_progreso',
      aciertos: 0,
      completadaEn: null,
    };
    expect(leccionesCompletadas([enProgreso]).has('l1a')).toBe(false);
    expect(leccionesCompletadas([completada('l1a')]).has('l1a')).toBe(true);
  });
});

describe('path — porcentaje por unidad (e)', () => {
  it('calcula completadas/total y 0 % en unidad vacía sin dividir por cero', () => {
    const ruta = construirRuta(cursoBase(), null, [completada('l1a')]);
    const [u1, u2] = ruta.unidades;
    expect(u1.porcentaje).toBe(50); // 1 de 2
    expect(u2.porcentaje).toBe(0); // vacía
    expect(Number.isNaN(u2.porcentaje)).toBe(false);
  });

  it('porcentajeUnidad devuelve 0 para una unidad vacía', () => {
    const vacia = unidad('uv', 1, []);
    expect(porcentajeUnidad(vacia, new Set())).toBe(0);
  });
});

describe('path — filtro por unidadesActivas (f)', () => {
  it('una lista no vacía filtra a ese conjunto de ids', () => {
    const activas = unidadesActivasOrdenadas(cursoBase(), ['u1']);
    expect(activas.map((u) => u.id)).toEqual(['u1']);

    const ruta = construirRuta(cursoBase(), ['u3'], []);
    expect(ruta.unidades.map((u) => u.id)).toEqual(['u3']);
    // Con solo U3 activa, su primera lección es la primera global: disponible.
    expect(ruta.unidades[0].lecciones[0].estado).toBe('disponible');
  });

  it('null muestra todas las unidades (fallback R6.4)', () => {
    const activas = unidadesActivasOrdenadas(cursoBase(), null);
    expect(activas.map((u) => u.id)).toEqual(['u1', 'u2', 'u3']);
  });
});
