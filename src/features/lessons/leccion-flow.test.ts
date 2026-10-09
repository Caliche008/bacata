import { describe, expect, it } from 'vitest';
import type { Ejercicio, Leccion } from '../../content';
import {
  construirResumen,
  estadoInicial,
  reducer,
  todosEvaluablesResueltos,
  evaluarEjercicio,
} from './leccion-flow';

/**
 * Pruebas del reducer puro del flujo (9.5b): responder/feedback/reintentar/
 * avanzar/completar; un sensible OMITIDO no bloquea (R12.4); `rehidratar` fija el
 * índice (R3.9); `construirResumen` cuenta aciertos.
 */

function meta(sensible = false, notaContexto?: string): Ejercicio['meta'] {
  return {
    tema: 'Convivencia',
    etiquetas: ['paz'],
    estado: 'aprobado',
    ...(sensible ? { sensible: true, notaContexto: notaContexto ?? 'Nota de contexto' } : {}),
  };
}

function opcion(id: string, enunciado: string): Ejercicio {
  return {
    id,
    tipo: 'opcion_multiple',
    enunciado,
    opciones: [
      { id: 'a', texto: 'Sí', esCorrecta: true, retro: 'Correcto.' },
      { id: 'b', texto: 'No', esCorrecta: false, retro: 'Casi.' },
    ],
    retroalimentacion: 'Retro.',
    meta: meta(),
  };
}

function leccionCon(ejercicios: Ejercicio[]): Leccion {
  return {
    id: 'l-test',
    titulo: 'Lección de prueba',
    objetivoAprendizaje: 'Objetivo',
    competencia: 'Competencia',
    orden: 1,
    ejercicios,
  };
}

describe('reducer — responder/feedback/reintentar/avanzar', () => {
  const leccion = leccionCon([opcion('e1', 'Uno'), opcion('e2', 'Dos')]);

  it('responder pasa a feedback y guarda intento y resultado', () => {
    const inicial = estadoInicial(leccion);
    const resultado = evaluarEjercicio(leccion.ejercicios[0], {
      tipo: 'opcion_multiple',
      opcionId: 'b',
    });
    const estado = reducer(leccion, inicial, {
      tipo: 'responder',
      ejercicioId: 'e1',
      respuesta: { tipo: 'opcion_multiple', opcionId: 'b' },
      resultado,
    });
    expect(estado.fase).toBe('feedback');
    expect(estado.intentos.e1).toBe(1);
    expect(estado.resultados.e1.correcto).toBe(false);
  });

  it('reintentar vuelve a respondiendo y un segundo intento acierta', () => {
    let estado = estadoInicial(leccion);
    estado = reducer(leccion, estado, {
      tipo: 'responder',
      ejercicioId: 'e1',
      respuesta: { tipo: 'opcion_multiple', opcionId: 'b' },
      resultado: evaluarEjercicio(leccion.ejercicios[0], {
        tipo: 'opcion_multiple',
        opcionId: 'b',
      }),
    });
    estado = reducer(leccion, estado, { tipo: 'reintentar', ejercicioId: 'e1' });
    expect(estado.fase).toBe('respondiendo');
    estado = reducer(leccion, estado, {
      tipo: 'responder',
      ejercicioId: 'e1',
      respuesta: { tipo: 'opcion_multiple', opcionId: 'a' },
      resultado: evaluarEjercicio(leccion.ejercicios[0], {
        tipo: 'opcion_multiple',
        opcionId: 'a',
      }),
    });
    expect(estado.resultados.e1.correcto).toBe(true);
    expect(estado.intentos.e1).toBe(2);
  });

  it('avanzar pasa al siguiente ejercicio y luego a completada', () => {
    let estado = estadoInicial(leccion);
    estado = reducer(leccion, estado, { tipo: 'avanzar' });
    expect(estado.indice).toBe(1);
    estado = reducer(leccion, estado, { tipo: 'avanzar' });
    expect(estado.fase).toBe('completada');
  });
});

describe('reducer — ejercicio sensible omitido (R12.4)', () => {
  const sensible: Ejercicio = { ...opcion('e2', 'Sensible'), meta: meta(true) };
  const leccion = leccionCon([opcion('e1', 'Uno'), sensible]);

  it('un sensible arranca en intro-sensible', () => {
    const estado = estadoInicial(leccion, 1);
    expect(estado.fase).toBe('intro-sensible');
  });

  it('omitir el sensible no bloquea completar la lección', () => {
    let estado = estadoInicial(leccion);
    // Resuelve e1 correctamente.
    estado = reducer(leccion, estado, {
      tipo: 'responder',
      ejercicioId: 'e1',
      respuesta: { tipo: 'opcion_multiple', opcionId: 'a' },
      resultado: evaluarEjercicio(leccion.ejercicios[0], {
        tipo: 'opcion_multiple',
        opcionId: 'a',
      }),
    });
    estado = reducer(leccion, estado, { tipo: 'avanzar' });
    // Omite el sensible.
    estado = reducer(leccion, estado, { tipo: 'omitirSensible', ejercicioId: 'e2' });
    expect(estado.omitidos).toContain('e2');
    expect(estado.fase).toBe('completada');
    expect(todosEvaluablesResueltos(leccion, estado)).toBe(true);
  });
});

describe('reducer — rehidratar (R3.9)', () => {
  const leccion = leccionCon([opcion('e1', 'Uno'), opcion('e2', 'Dos'), opcion('e3', 'Tres')]);

  it('fija el índice al avance parcial guardado', () => {
    const estado = reducer(leccion, estadoInicial(leccion), { tipo: 'rehidratar', indice: 2 });
    expect(estado.indice).toBe(2);
    expect(estado.fase).toBe('respondiendo');
  });
});

describe('construirResumen', () => {
  const leccion = leccionCon([opcion('e1', 'Uno'), opcion('e2', 'Dos')]);

  it('cuenta evaluables y aciertos de primer intento', () => {
    let estado = estadoInicial(leccion);
    estado = reducer(leccion, estado, {
      tipo: 'responder',
      ejercicioId: 'e1',
      respuesta: { tipo: 'opcion_multiple', opcionId: 'a' },
      resultado: evaluarEjercicio(leccion.ejercicios[0], {
        tipo: 'opcion_multiple',
        opcionId: 'a',
      }),
    });
    estado = reducer(leccion, estado, { tipo: 'avanzar' });
    estado = reducer(leccion, estado, {
      tipo: 'responder',
      ejercicioId: 'e2',
      respuesta: { tipo: 'opcion_multiple', opcionId: 'a' },
      resultado: evaluarEjercicio(leccion.ejercicios[1], {
        tipo: 'opcion_multiple',
        opcionId: 'a',
      }),
    });
    const resumen = construirResumen(leccion, estado);
    expect(resumen.totalEvaluables).toBe(2);
    expect(resumen.aciertos).toBe(2);
    expect(resumen.aciertosPrimerIntento).toBe(2);
  });
});
