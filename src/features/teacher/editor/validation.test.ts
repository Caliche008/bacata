import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Curso, Leccion, Unidad } from '../../../content/types';
import {
  erroresCurso,
  erroresLeccion,
  erroresUnidad,
  sinErrores,
} from './validation';

/**
 * Pruebas de la validación en vivo. El fixture es el `grado-6.json` real: un
 * curso válido no debe reportar errores; los sub-objetos vacíos deben reportar
 * el mensaje en español correcto por campo.
 */

const cursoValido = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'cursos', 'grado-6.json'), 'utf8'),
) as Curso;

describe('erroresCurso', () => {
  it('un curso válido no reporta errores', () => {
    const errores = erroresCurso(cursoValido);
    expect(sinErrores(errores)).toBe(true);
  });

  it('campos vacíos del curso reportan mensajes en español por campo', () => {
    const errores = erroresCurso({
      id: '',
      grado: 6,
      area: 'ciencias_sociales',
      titulo: '',
      descripcion: '',
      version: '',
      unidades: [],
    });
    expect(errores.titulo).toMatch(/no puede estar vacío/);
    expect(errores.descripcion).toMatch(/no puede estar vacío/);
    expect(errores.version).toMatch(/no puede estar vacío/);
  });
});

describe('erroresUnidad', () => {
  const unidadBase: Unidad = {
    id: 'u6-x',
    titulo: 'Convivencia',
    descripcion: 'Descripción de la unidad',
    orden: 1,
    objetivos: [],
    ejePaz: true,
    catedraPaz: {
      tematicas: ['Cultura de la paz'],
      como: 'Trabaja la resolución pacífica de conflictos.',
    },
    lecciones: [],
  };

  it('una unidad válida no reporta errores', () => {
    expect(sinErrores(erroresUnidad(unidadBase))).toBe(true);
  });

  it('exige al menos una temática de Cátedra de la Paz', () => {
    const errores = erroresUnidad({
      ...unidadBase,
      catedraPaz: { tematicas: [], como: 'algo' },
    });
    expect(errores['catedraPaz.tematicas']).toMatch(/al menos una temática/);
  });

  it('exige el "cómo" de la Cátedra de la Paz', () => {
    const errores = erroresUnidad({
      ...unidadBase,
      catedraPaz: { tematicas: ['Cultura de la paz'], como: '' },
    });
    expect(errores['catedraPaz.como']).toBeDefined();
  });

  it('exige que ejePaz sea booleano (requerido)', () => {
    const sinEje: Partial<Unidad> = { ...unidadBase };
    delete sinEje.ejePaz;
    const errores = erroresUnidad(sinEje);
    expect(errores.ejePaz).toBeDefined();
  });
});

describe('erroresLeccion', () => {
  const leccionBase: Leccion = {
    id: 'l6-x',
    titulo: 'Lección',
    objetivoAprendizaje: 'Objetivo claro',
    competencia: 'Competencia ciudadana',
    orden: 1,
    ejercicios: [],
  };

  it('una lección válida no reporta errores', () => {
    expect(sinErrores(erroresLeccion(leccionBase))).toBe(true);
  });

  it('campos vacíos de la lección reportan mensajes en español', () => {
    const errores = erroresLeccion({ ...leccionBase, titulo: '', competencia: '' });
    expect(errores.titulo).toMatch(/no puede estar vacío/);
    expect(errores.competencia).toMatch(/no puede estar vacío/);
  });
});
