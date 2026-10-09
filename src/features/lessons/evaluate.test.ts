import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cursoSchema } from '../../content';
import type {
  AnalisisFuente,
  Completar,
  Curso,
  Dilema,
  Emparejar,
  OpcionMultiple,
  Ordenar,
  VerdaderoFalso,
} from '../../content';
import { esEvaluable, evaluarEjercicio } from './evaluate';

/**
 * Pruebas del evaluador puro (9.5a) usando la lección REAL de la unidad 1 de 6°
 * (`l6-conv-1`), que contiene un ejercicio de cada uno de los 7 tipos. Verifican
 * acierto/error por tipo, el dilema SIN veredicto (R3.3) y la agregación de
 * `analisis_fuente` con `detalle` por pregunta.
 */

const curso = cursoSchema.parse(
  JSON.parse(readFileSync(join(process.cwd(), 'content', 'cursos', 'grado-6.json'), 'utf8')),
) as Curso;

const leccion = curso.unidades[0].lecciones[0];

function ejercicio<T extends { tipo: string }>(tipo: T['tipo']) {
  const e = leccion.ejercicios.find((item) => item.tipo === tipo);
  if (!e) {
    throw new Error(`No se encontró un ejercicio de tipo ${tipo} en la lección semilla`);
  }
  return e;
}

describe('evaluarEjercicio — opcion_multiple', () => {
  const e = ejercicio<OpcionMultiple>('opcion_multiple') as OpcionMultiple;

  it('acierta con la opción correcta y usa su retro', () => {
    const correcta = e.opciones.find((o) => o.esCorrecta)!;
    const r = evaluarEjercicio(e, { tipo: 'opcion_multiple', opcionId: correcta.id });
    expect(r.correcto).toBe(true);
    expect(r.retroalimentacion).toBe(correcta.retro);
  });

  it('falla con una opción incorrecta y da pista', () => {
    const incorrecta = e.opciones.find((o) => !o.esCorrecta)!;
    const r = evaluarEjercicio(e, { tipo: 'opcion_multiple', opcionId: incorrecta.id });
    expect(r.correcto).toBe(false);
    expect(r.hint).toBeTruthy();
  });
});

describe('evaluarEjercicio — verdadero_falso', () => {
  const e = ejercicio<VerdaderoFalso>('verdadero_falso') as VerdaderoFalso;

  it('acierta con el valor correcto y devuelve la justificación', () => {
    const r = evaluarEjercicio(e, { tipo: 'verdadero_falso', valor: e.respuestaCorrecta });
    expect(r.correcto).toBe(true);
    expect(r.retroalimentacion).toBe(e.justificacion);
  });

  it('falla con el valor opuesto', () => {
    const r = evaluarEjercicio(e, { tipo: 'verdadero_falso', valor: !e.respuestaCorrecta });
    expect(r.correcto).toBe(false);
  });
});

describe('evaluarEjercicio — emparejar', () => {
  const e = ejercicio<Emparejar>('emparejar') as Emparejar;

  it('acierta cuando cada izquierda apunta a su par', () => {
    const asignaciones: Record<number, number> = {};
    e.pares.forEach((_, indice) => {
      asignaciones[indice] = indice;
    });
    const r = evaluarEjercicio(e, { tipo: 'emparejar', asignaciones });
    expect(r.correcto).toBe(true);
  });

  it('falla con una asignación cruzada', () => {
    const asignaciones: Record<number, number> = {};
    e.pares.forEach((_, indice) => {
      asignaciones[indice] = indice;
    });
    // Cruza las dos primeras.
    asignaciones[0] = 1;
    asignaciones[1] = 0;
    const r = evaluarEjercicio(e, { tipo: 'emparejar', asignaciones });
    expect(r.correcto).toBe(false);
  });
});

describe('evaluarEjercicio — ordenar', () => {
  const e = ejercicio<Ordenar>('ordenar') as Ordenar;

  it('acierta con el orden esperado', () => {
    const ordenIds = [...e.elementos].sort((a, b) => a.orden - b.orden).map((el) => el.id);
    const r = evaluarEjercicio(e, { tipo: 'ordenar', ordenIds });
    expect(r.correcto).toBe(true);
  });

  it('falla con un orden alterado', () => {
    const ordenIds = [...e.elementos].sort((a, b) => a.orden - b.orden).map((el) => el.id);
    [ordenIds[0], ordenIds[1]] = [ordenIds[1], ordenIds[0]];
    const r = evaluarEjercicio(e, { tipo: 'ordenar', ordenIds });
    expect(r.correcto).toBe(false);
  });
});

describe('evaluarEjercicio — completar', () => {
  const e = ejercicio<Completar>('completar') as Completar;

  it('acierta con todas las selecciones correctas', () => {
    const selecciones: Record<string, string> = {};
    e.huecos.forEach((hueco) => {
      selecciones[hueco.id] = hueco.correcta;
    });
    const r = evaluarEjercicio(e, { tipo: 'completar', selecciones });
    expect(r.correcto).toBe(true);
  });

  it('falla si un hueco es incorrecto', () => {
    const selecciones: Record<string, string> = {};
    e.huecos.forEach((hueco) => {
      selecciones[hueco.id] = hueco.correcta;
    });
    const primero = e.huecos[0];
    selecciones[primero.id] = primero.opciones.find((o) => o !== primero.correcta)!;
    const r = evaluarEjercicio(e, { tipo: 'completar', selecciones });
    expect(r.correcto).toBe(false);
  });
});

describe('evaluarEjercicio — dilema (sin veredicto, R3.3)', () => {
  const e = ejercicio<Dilema>('dilema') as Dilema;

  it('nunca marca correcto/incorrecto y devuelve la reflexión de la opción', () => {
    const opcion = e.opciones[1];
    const r = evaluarEjercicio(e, { tipo: 'dilema', opcionId: opcion.id });
    expect(r.correcto).toBeNull();
    expect(r.retroalimentacion).toBe(opcion.reflexion);
  });

  it('no es evaluable', () => {
    expect(esEvaluable(e)).toBe(false);
  });
});

describe('evaluarEjercicio — analisis_fuente (agregación)', () => {
  const e = ejercicio<AnalisisFuente>('analisis_fuente') as AnalisisFuente;

  it('acierta cuando todas las preguntas son correctas y agrega detalle', () => {
    const respuestas: Record<string, string> = {};
    e.preguntas.forEach((pregunta) => {
      respuestas[pregunta.id] = pregunta.opciones.find((o) => o.esCorrecta)!.id;
    });
    const r = evaluarEjercicio(e, { tipo: 'analisis_fuente', respuestas });
    expect(r.correcto).toBe(true);
    expect(r.detalle).toHaveLength(e.preguntas.length);
    expect(r.detalle?.every((d) => d.correcto)).toBe(true);
  });

  it('falla si una pregunta es incorrecta y lo refleja en el detalle', () => {
    const respuestas: Record<string, string> = {};
    e.preguntas.forEach((pregunta) => {
      respuestas[pregunta.id] = pregunta.opciones.find((o) => o.esCorrecta)!.id;
    });
    const primera = e.preguntas[0];
    respuestas[primera.id] = primera.opciones.find((o) => !o.esCorrecta)!.id;
    const r = evaluarEjercicio(e, { tipo: 'analisis_fuente', respuestas });
    expect(r.correcto).toBe(false);
    expect(r.detalle?.find((d) => d.preguntaId === primera.id)?.correcto).toBe(false);
  });
});
