import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getCachedCourse, putCachedCourse, resetDb } from '../lib/storage';
import {
  filtrarCursoAprobado,
  initContent,
  isNewerVersion,
  loadBundledCourses,
  validarYFiltrarCurso,
} from './loader';
import {
  getCursoPorGrado,
  getLeccion,
  getUnidad,
  listarLecciones,
  listarUnidades,
} from './selectors';
import type { Curso } from './types';

/**
 * Pruebas del loader y los selectores de contenido (tarea 5).
 *
 * - Carga/validación: usan el glob real de Vite sobre el contenido semilla.
 * - Degradación/filtrado de borradores: usan fixtures construidos aquí para no
 *   depender del glob (vía `validarYFiltrarCurso`/`filtrarCursoAprobado`).
 * - `initContent`: usa `fake-indexeddb` recreando la `IDBFactory` por prueba,
 *   igual que `storage.test.ts`.
 */

const seedCurso6 = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'cursos', 'grado-6.json'), 'utf8'),
) as Curso;

/** Curso mínimo válido reutilizable como base de los fixtures. */
function cursoValidoBase(): Curso {
  return {
    id: 'curso-fixture',
    grado: 6,
    area: 'ciencias_sociales',
    titulo: 'Curso de prueba',
    descripcion: 'Curso para pruebas del loader.',
    version: '0.1.0',
    unidades: [
      {
        id: 'u-2',
        titulo: 'Segunda unidad',
        descripcion: 'Va de segunda.',
        orden: 2,
        objetivos: ['Objetivo'],
        ejePaz: true,
        catedraPaz: {
          tematicas: ['Cultura de la paz'],
          como: 'Trabaja la convivencia.',
        },
        lecciones: [
          {
            id: 'l-2',
            titulo: 'Lección dos',
            objetivoAprendizaje: 'Aprender dos.',
            competencia: 'Competencia dos.',
            orden: 2,
            ejercicios: [],
          },
          {
            id: 'l-1',
            titulo: 'Lección uno',
            objetivoAprendizaje: 'Aprender uno.',
            competencia: 'Competencia uno.',
            orden: 1,
            ejercicios: [
              {
                id: 'ej-aprobado',
                tipo: 'verdadero_falso',
                enunciado: 'La convivencia pacífica se construye con diálogo.',
                respuestaCorrecta: true,
                justificacion: 'El diálogo permite resolver desacuerdos sin violencia.',
                meta: { tema: 'Convivencia', etiquetas: ['paz'], estado: 'aprobado' },
              },
              {
                id: 'ej-borrador',
                tipo: 'verdadero_falso',
                enunciado: 'Ejercicio en borrador.',
                respuestaCorrecta: false,
                justificacion: 'Aún no aprobado.',
                meta: { tema: 'Convivencia', etiquetas: ['paz'], estado: 'borrador' },
              },
            ],
          },
        ],
      },
      {
        id: 'u-1',
        titulo: 'Primera unidad',
        descripcion: 'Va de primera.',
        orden: 1,
        objetivos: ['Objetivo'],
        ejePaz: true,
        catedraPaz: {
          tematicas: ['Memoria histórica'],
          como: 'Trabaja la memoria.',
        },
        lecciones: [],
      },
    ],
  };
}

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('loadBundledCourses — carga y validación del contenido empaquetado', () => {
  it('carga y valida los cursos de 6° y 7° sin errores', () => {
    const { index, errores } = loadBundledCourses();

    expect(errores).toEqual([]);
    expect(getCursoPorGrado(index, 6)?.grado).toBe(6);
    expect(getCursoPorGrado(index, 7)?.grado).toBe(7);
  });
});

describe('validarYFiltrarCurso — degradación elegante', () => {
  it('excluye un curso malformado y reporta una traza no sensible, sin lanzar', () => {
    const malformado = { ...cursoValidoBase(), area: 'matematicas' };

    const resultado = validarYFiltrarCurso('fixture-invalido.json', malformado);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.archivo).toBe('fixture-invalido.json');
      expect(resultado.error.problemas.length).toBeGreaterThan(0);
      const rutas = resultado.error.problemas.map((p) => p.ruta);
      expect(rutas.some((r) => r.includes('area'))).toBe(true);
    }
  });

  it('acepta un curso válido y lo devuelve filtrado', () => {
    const resultado = validarYFiltrarCurso('fixture-valido.json', cursoValidoBase());
    expect(resultado.ok).toBe(true);
  });
});

describe('filtrarCursoAprobado — filtrado de borradores (R7.8)', () => {
  it('excluye ejercicios en borrador y conserva lección, unidad y metadatos de paz', () => {
    const curso = filtrarCursoAprobado(cursoValidoBase());
    const unidad = getUnidad(curso, 'u-2');
    const leccion = unidad && getLeccion(unidad, 'l-1');

    expect(leccion?.ejercicios.map((e) => e.id)).toEqual(['ej-aprobado']);
    // La estructura y los metadatos de Cátedra de la Paz se conservan.
    expect(unidad?.ejePaz).toBe(true);
    expect(unidad?.catedraPaz.tematicas).toContain('Cultura de la paz');
    expect(curso.unidades).toHaveLength(2);
  });

  it('no muta el curso original', () => {
    const original = cursoValidoBase();
    const antes = original.unidades[0].lecciones[0].ejercicios.length;
    filtrarCursoAprobado(original);
    expect(original.unidades[0].lecciones[0].ejercicios).toHaveLength(antes);
  });
});

describe('isNewerVersion — comparación de versiones', () => {
  it('compara semver correctamente', () => {
    expect(isNewerVersion('0.2.0', '0.1.0')).toBe(true);
    expect(isNewerVersion('1.0.0', '0.9.9')).toBe(true);
    expect(isNewerVersion('0.1.0', '0.2.0')).toBe(false);
    expect(isNewerVersion('0.1.0', '0.1.0')).toBe(false);
  });

  it('cae a comparación de cadena cuando no es semver', () => {
    expect(isNewerVersion('2024-02', '2024-01')).toBe(true);
    expect(isNewerVersion('2024-01', '2024-02')).toBe(false);
  });
});

describe('selectores — orden por `orden` y búsqueda por id', () => {
  it('listarUnidades ordena por `orden` sin mutar el original', () => {
    const curso = cursoValidoBase();
    const ordenadas = listarUnidades(curso);
    expect(ordenadas.map((u) => u.id)).toEqual(['u-1', 'u-2']);
    // El arreglo original no se reordena.
    expect(curso.unidades.map((u) => u.id)).toEqual(['u-2', 'u-1']);
  });

  it('listarLecciones ordena por `orden`', () => {
    const curso = cursoValidoBase();
    const unidad = getUnidad(curso, 'u-2');
    expect(unidad).toBeDefined();
    if (unidad) {
      expect(listarLecciones(unidad).map((l) => l.id)).toEqual(['l-1', 'l-2']);
    }
  });

  it('getUnidad/getLeccion devuelven la entidad por id y undefined si no existe', () => {
    const curso = cursoValidoBase();
    expect(getUnidad(curso, 'u-1')?.id).toBe('u-1');
    expect(getUnidad(curso, 'inexistente')).toBeUndefined();

    const unidad = getUnidad(curso, 'u-2');
    expect(unidad && getLeccion(unidad, 'l-1')?.id).toBe('l-1');
    expect(unidad && getLeccion(unidad, 'inexistente')).toBeUndefined();
  });

  it('getCursoPorGrado devuelve el curso del grado cargado', () => {
    const { index } = loadBundledCourses();
    expect(getCursoPorGrado(index, 6)).toBeDefined();
  });
});

describe('initContent — poblado y actualización de la caché por grado', () => {
  it('con caché vacía escribe cada grado con la versión del empaquetado', async () => {
    await initContent();

    const cache6 = await getCachedCourse(6);
    const cache7 = await getCachedCourse(7);
    expect(cache6?.version).toBe(seedCurso6.version);
    expect(cache6?.curso.id).toBe(seedCurso6.id);
    expect(cache7?.grado).toBe(7);
    // Los ids se conservan entre empaquetado y caché (no se regeneran).
    expect(cache6?.curso.unidades[0]?.id).toBe(seedCurso6.unidades[0]?.id);
  });

  it('no sobreescribe una caché con versión superior', async () => {
    await putCachedCourse(6, '9.9.9', { ...seedCurso6, titulo: 'Versión futura' });

    await initContent();

    const cache6 = await getCachedCourse(6);
    expect(cache6?.version).toBe('9.9.9');
    expect(cache6?.curso.titulo).toBe('Versión futura');
  });

  it('actualiza cuando el empaquetado es más nuevo que la caché', async () => {
    await putCachedCourse(6, '0.0.1', { ...seedCurso6, titulo: 'Versión vieja' });

    await initContent();

    const cache6 = await getCachedCourse(6);
    expect(cache6?.version).toBe(seedCurso6.version);
    expect(cache6?.curso.titulo).toBe(seedCurso6.titulo);
  });
});
