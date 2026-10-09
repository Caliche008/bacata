import type { Ejercicio } from '../../content';

/**
 * Tipos de respuesta del estudiante y resultado del evaluador (tarea 9).
 *
 * `Respuesta` es una unión discriminada por `tipo`, paralela a `Ejercicio`
 * (misma clave `tipo`). Así el evaluador hace narrowing seguro sin `any` y los
 * renderizadores producen exactamente la forma que el evaluador consume.
 *
 * No conoce React ni storage: es solo el contrato de datos entre renderizadores
 * y evaluador.
 */

/** opcion_multiple → id de la opción elegida. */
export interface RespuestaOpcionMultiple {
  tipo: 'opcion_multiple';
  opcionId: string | null;
}

/** verdadero_falso → valor elegido. */
export interface RespuestaVerdaderoFalso {
  tipo: 'verdadero_falso';
  valor: boolean | null;
}

/**
 * emparejar → por cada índice de izquierda (en el arreglo `pares`), el índice de
 * la derecha elegida (también en `pares`). Se barajan las derechas SOLO en
 * presentación; aquí se guardan los índices originales.
 */
export interface RespuestaEmparejar {
  tipo: 'emparejar';
  asignaciones: Record<number, number | null>;
}

/** ordenar → ids de `elementos` en el orden elegido por el estudiante. */
export interface RespuestaOrdenar {
  tipo: 'ordenar';
  ordenIds: string[];
}

/** completar → por cada id de hueco, la opción seleccionada. */
export interface RespuestaCompletar {
  tipo: 'completar';
  selecciones: Record<string, string | null>;
}

/** dilema → id de la opción elegida (sin veredicto, R3.3). */
export interface RespuestaDilema {
  tipo: 'dilema';
  opcionId: string | null;
}

/** analisis_fuente → por cada id de pregunta, el id de la opción elegida. */
export interface RespuestaAnalisisFuente {
  tipo: 'analisis_fuente';
  respuestas: Record<string, string | null>;
}

/** Unión discriminada por `tipo` (paralela a `Ejercicio`). */
export type Respuesta =
  | RespuestaOpcionMultiple
  | RespuestaVerdaderoFalso
  | RespuestaEmparejar
  | RespuestaOrdenar
  | RespuestaCompletar
  | RespuestaDilema
  | RespuestaAnalisisFuente;

/** Detalle por pregunta de un analisis_fuente. */
export interface DetalleAnalisis {
  preguntaId: string;
  correcto: boolean;
  retro: string;
}

/**
 * Resultado uniforme del evaluador. `correcto` es `null` para el dilema (sin
 * veredicto, R3.3); `boolean` para el resto. `retroalimentacion` es el texto
 * formativo (por qué). `hint` opcional refuerza el reintento en caso de error.
 */
export interface ResultadoEvaluacion {
  correcto: boolean | null;
  retroalimentacion: string;
  /** Pista adicional para reintentar (R3.6); se muestra en el Feedback. */
  hint?: string;
  /** Solo para analisis_fuente: desglose por pregunta. */
  detalle?: DetalleAnalisis[];
}

/**
 * Resumen de una lección completada. Es el payload del enganche
 * `onLeccionCompletada` que la tarea 10 (XP/rachas) consumirá; aquí NO se
 * implementa lógica de XP.
 */
export interface ResumenLeccion {
  leccionId: string;
  /** Total de ejercicios EVALUABLES (excluye dilemas y sensibles omitidos). */
  totalEvaluables: number;
  /** Evaluables respondidos correctamente (en cualquier intento). */
  aciertos: number;
  /** Evaluables acertados en el PRIMER intento. */
  aciertosPrimerIntento: number;
  /** Ids de ejercicios sensibles que el estudiante omitió. */
  omitidos: string[];
}

/**
 * Respuesta inicial (vacía) para un ejercicio, usada por el flujo y los
 * renderizadores controlados. Para `ordenar` arranca con el orden declarado de
 * los elementos; el renderizador puede barajar la presentación.
 */
export function respuestaInicial(ejercicio: Ejercicio): Respuesta {
  switch (ejercicio.tipo) {
    case 'opcion_multiple':
      return { tipo: 'opcion_multiple', opcionId: null };
    case 'verdadero_falso':
      return { tipo: 'verdadero_falso', valor: null };
    case 'emparejar': {
      const asignaciones: Record<number, number | null> = {};
      ejercicio.pares.forEach((_, indice) => {
        asignaciones[indice] = null;
      });
      return { tipo: 'emparejar', asignaciones };
    }
    case 'ordenar':
      return { tipo: 'ordenar', ordenIds: ejercicio.elementos.map((elemento) => elemento.id) };
    case 'completar': {
      const selecciones: Record<string, string | null> = {};
      ejercicio.huecos.forEach((hueco) => {
        selecciones[hueco.id] = null;
      });
      return { tipo: 'completar', selecciones };
    }
    case 'dilema':
      return { tipo: 'dilema', opcionId: null };
    case 'analisis_fuente': {
      const respuestas: Record<string, string | null> = {};
      ejercicio.preguntas.forEach((pregunta) => {
        respuestas[pregunta.id] = null;
      });
      return { tipo: 'analisis_fuente', respuestas };
    }
  }
}
