import type { Ejercicio, Leccion } from '../../content';
import type { Respuesta, ResultadoEvaluacion, ResumenLeccion } from './answers';
import { esEvaluable, evaluarEjercicio } from './evaluate';

/**
 * Reducer PURO del flujo de lección (tarea 9.3/9.4), sin React ni storage. Modela
 * el avance por ejercicios, el reintento tras un error (R3.6), la omisión de
 * ejercicios sensibles (R12.4) y la detección de "lección completada" (R3.4). El
 * componente solo despacha acciones y renderiza; la persistencia la hace el
 * wrapper de storage.
 */

export type FaseFlujo =
  | 'intro-sensible' // mostrando notaContexto de un ejercicio sensible (R12.3)
  | 'respondiendo' // el estudiante responde el ejercicio actual
  | 'feedback' // se muestra la retroalimentación tras responder
  | 'completada'; // todos los evaluables resueltos (R3.4)

export interface EstadoFlujo {
  indice: number;
  fase: FaseFlujo;
  respuestas: Record<string, Respuesta>;
  resultados: Record<string, ResultadoEvaluacion>;
  intentos: Record<string, number>;
  /** Ids de ejercicios sensibles que el estudiante omitió (R12.4). */
  omitidos: string[];
}

export type AccionFlujo =
  | { tipo: 'responder'; ejercicioId: string; respuesta: Respuesta; resultado: ResultadoEvaluacion }
  | { tipo: 'reintentar'; ejercicioId: string }
  | { tipo: 'avanzar' }
  | { tipo: 'omitirSensible'; ejercicioId: string }
  | { tipo: 'mostrarEjercicio' }
  | { tipo: 'rehidratar'; indice: number };

/** Fase inicial de un ejercicio: muestra la nota de contexto si es sensible. */
export function faseInicial(ejercicio: Ejercicio): FaseFlujo {
  const sensible =
    ejercicio.meta.sensible === true && (ejercicio.meta.notaContexto ?? '').length > 0;
  return sensible ? 'intro-sensible' : 'respondiendo';
}

/** Estado inicial para la lección (opcionalmente rehidratado a `indiceInicial`). */
export function estadoInicial(leccion: Leccion, indiceInicial = 0): EstadoFlujo {
  const indice = Math.min(Math.max(indiceInicial, 0), Math.max(leccion.ejercicios.length - 1, 0));
  const ejercicio = leccion.ejercicios[indice];
  return {
    indice,
    fase: ejercicio ? faseInicial(ejercicio) : 'completada',
    respuestas: {},
    resultados: {},
    intentos: {},
    omitidos: [],
  };
}

/**
 * ¿Está resuelto el ejercicio en el índice dado? Un evaluable está resuelto si se
 * respondió correctamente; un dilema (no evaluable) se resuelve al responderlo;
 * un sensible omitido se considera resuelto (no bloquea, R12.4).
 */
function ejercicioResuelto(leccion: Leccion, estado: EstadoFlujo, indice: number): boolean {
  const ejercicio = leccion.ejercicios[indice];
  if (!ejercicio) {
    return true;
  }
  if (estado.omitidos.includes(ejercicio.id)) {
    return true;
  }
  const resultado = estado.resultados[ejercicio.id];
  if (!resultado) {
    return false;
  }
  if (!esEvaluable(ejercicio)) {
    return true; // dilema: responderlo basta
  }
  return resultado.correcto === true;
}

/**
 * ¿Están resueltos todos los ejercicios EVALUABLES? Los dilemas respondidos y los
 * sensibles omitidos no bloquean (R3.4/R12.4).
 */
export function todosEvaluablesResueltos(leccion: Leccion, estado: EstadoFlujo): boolean {
  return leccion.ejercicios.every((_, indice) => ejercicioResuelto(leccion, estado, indice));
}

/** Siguiente índice al avanzar. */
function siguienteIndice(indice: number): number {
  return indice + 1;
}

export function reducer(leccion: Leccion, estado: EstadoFlujo, accion: AccionFlujo): EstadoFlujo {
  switch (accion.tipo) {
    case 'mostrarEjercicio':
      return { ...estado, fase: 'respondiendo' };

    case 'responder': {
      return {
        ...estado,
        fase: 'feedback',
        respuestas: { ...estado.respuestas, [accion.ejercicioId]: accion.respuesta },
        resultados: { ...estado.resultados, [accion.ejercicioId]: accion.resultado },
        intentos: {
          ...estado.intentos,
          [accion.ejercicioId]: (estado.intentos[accion.ejercicioId] ?? 0) + 1,
        },
      };
    }

    case 'reintentar':
      return { ...estado, fase: 'respondiendo' };

    case 'omitirSensible': {
      const omitidos = estado.omitidos.includes(accion.ejercicioId)
        ? estado.omitidos
        : [...estado.omitidos, accion.ejercicioId];
      const siguiente = siguienteIndice(estado.indice);
      const avanzado = { ...estado, omitidos };
      if (siguiente >= leccion.ejercicios.length) {
        return { ...avanzado, fase: 'completada' };
      }
      return {
        ...avanzado,
        indice: siguiente,
        fase: faseInicial(leccion.ejercicios[siguiente]),
      };
    }

    case 'avanzar': {
      const siguiente = siguienteIndice(estado.indice);
      if (siguiente >= leccion.ejercicios.length) {
        return { ...estado, fase: 'completada' };
      }
      return {
        ...estado,
        indice: siguiente,
        fase: faseInicial(leccion.ejercicios[siguiente]),
      };
    }

    case 'rehidratar': {
      const indice = Math.min(
        Math.max(accion.indice, 0),
        Math.max(leccion.ejercicios.length - 1, 0),
      );
      const ejercicio = leccion.ejercicios[indice];
      return {
        ...estado,
        indice,
        fase: ejercicio ? faseInicial(ejercicio) : 'completada',
      };
    }

    default: {
      const _exhaustivo: never = accion;
      return _exhaustivo;
    }
  }
}

/**
 * Construye el resumen de la lección para el enganche `onLeccionCompletada`
 * (payload de la tarea 10). Cuenta evaluables, aciertos totales y aciertos en el
 * primer intento. No implementa XP.
 */
export function construirResumen(leccion: Leccion, estado: EstadoFlujo): ResumenLeccion {
  let totalEvaluables = 0;
  let aciertos = 0;
  let aciertosPrimerIntento = 0;

  for (const ejercicio of leccion.ejercicios) {
    if (!esEvaluable(ejercicio) || estado.omitidos.includes(ejercicio.id)) {
      continue;
    }
    totalEvaluables += 1;
    const resultado = estado.resultados[ejercicio.id];
    if (resultado?.correcto === true) {
      aciertos += 1;
      if ((estado.intentos[ejercicio.id] ?? 0) === 1) {
        aciertosPrimerIntento += 1;
      }
    }
  }

  return {
    leccionId: leccion.id,
    totalEvaluables,
    aciertos,
    aciertosPrimerIntento,
    omitidos: [...estado.omitidos],
  };
}

/** Reexport conveniente para que el componente evalúe antes de despachar. */
export { evaluarEjercicio };
