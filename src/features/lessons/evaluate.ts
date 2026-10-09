import type {
  AnalisisFuente,
  Completar,
  Dilema,
  Emparejar,
  Ejercicio,
  OpcionMultiple,
  Ordenar,
  VerdaderoFalso,
} from '../../content';
import type {
  DetalleAnalisis,
  Respuesta,
  RespuestaAnalisisFuente,
  RespuestaCompletar,
  RespuestaDilema,
  RespuestaEmparejar,
  RespuestaOpcionMultiple,
  RespuestaOrdenar,
  RespuestaVerdaderoFalso,
  ResultadoEvaluacion,
} from './answers';

/**
 * Evaluador PURO de ejercicios (tarea 9.1). Funciones tipadas
 * `(ejercicio, respuesta) → ResultadoEvaluacion`, sin React ni storage, para
 * poder probarlas de forma aislada (patrón de `path.ts`).
 *
 * Reglas de retroalimentación (R3.2/R3.6): cada tipo devuelve un texto formativo
 * (el "por qué"), nunca solo "bien/mal". Los mensajes de encabezado de acierto/
 * error los pone el flujo con el componente `Feedback`/mascota (microcopy de
 * marca); aquí la `retroalimentacion` es la explicación específica del ejercicio.
 */

/** Mensajes de respaldo con tono de marca, por si el contenido no trae retro. */
const RETRO_ACIERTO_DEFECTO = '¡Muy bien! Así se razona.';
const RETRO_ERROR_DEFECTO = 'Casi. Revisa la explicación y vuelve a intentarlo.';
const HINT_DEFECTO = 'Vuelve a leer el enunciado con calma y prueba de nuevo.';

function evaluarOpcionMultiple(
  ejercicio: OpcionMultiple,
  respuesta: RespuestaOpcionMultiple,
): ResultadoEvaluacion {
  const opcion = ejercicio.opciones.find((o) => o.id === respuesta.opcionId);
  const correcto = opcion?.esCorrecta === true;
  const retro =
    opcion?.retro ??
    ejercicio.retroalimentacion ??
    (correcto ? RETRO_ACIERTO_DEFECTO : RETRO_ERROR_DEFECTO);
  return {
    correcto,
    retroalimentacion: retro,
    hint: correcto ? undefined : (ejercicio.retroalimentacion ?? HINT_DEFECTO),
  };
}

function evaluarVerdaderoFalso(
  ejercicio: VerdaderoFalso,
  respuesta: RespuestaVerdaderoFalso,
): ResultadoEvaluacion {
  const correcto = respuesta.valor === ejercicio.respuestaCorrecta;
  return {
    correcto,
    retroalimentacion: ejercicio.justificacion,
    hint: correcto ? undefined : (ejercicio.retroalimentacion ?? HINT_DEFECTO),
  };
}

function evaluarEmparejar(
  ejercicio: Emparejar,
  respuesta: RespuestaEmparejar,
): ResultadoEvaluacion {
  // Correcto si cada izquierda apunta a la derecha de su MISMO par (índice).
  const correcto = ejercicio.pares.every(
    (_, indice) => respuesta.asignaciones[indice] === indice,
  );
  return {
    correcto,
    retroalimentacion: ejercicio.retroalimentacion ?? RETRO_ACIERTO_DEFECTO,
    hint: correcto ? undefined : (ejercicio.retroalimentacion ?? HINT_DEFECTO),
  };
}

function evaluarOrdenar(ejercicio: Ordenar, respuesta: RespuestaOrdenar): ResultadoEvaluacion {
  const esperado = [...ejercicio.elementos]
    .sort((a, b) => a.orden - b.orden)
    .map((elemento) => elemento.id);
  const correcto =
    respuesta.ordenIds.length === esperado.length &&
    esperado.every((id, indice) => respuesta.ordenIds[indice] === id);
  return {
    correcto,
    retroalimentacion: ejercicio.retroalimentacion ?? RETRO_ACIERTO_DEFECTO,
    hint: correcto ? undefined : (ejercicio.retroalimentacion ?? HINT_DEFECTO),
  };
}

function evaluarCompletar(
  ejercicio: Completar,
  respuesta: RespuestaCompletar,
): ResultadoEvaluacion {
  const correcto = ejercicio.huecos.every(
    (hueco) => respuesta.selecciones[hueco.id] === hueco.correcta,
  );
  return {
    correcto,
    retroalimentacion: ejercicio.retroalimentacion ?? RETRO_ACIERTO_DEFECTO,
    hint: correcto ? undefined : (ejercicio.retroalimentacion ?? HINT_DEFECTO),
  };
}

/**
 * dilema: SIN veredicto (R3.3). Devuelve `correcto: null` y la `reflexion` de la
 * opción elegida como retroalimentación. Nunca marca correcto/incorrecto.
 */
function evaluarDilema(ejercicio: Dilema, respuesta: RespuestaDilema): ResultadoEvaluacion {
  const opcion = ejercicio.opciones.find((o) => o.id === respuesta.opcionId);
  return {
    correcto: null,
    retroalimentacion:
      opcion?.reflexion ??
      ejercicio.retroalimentacion ??
      'Cada decisión tiene consecuencias. ¿Quién sale ganando con cada opción?',
  };
}

function evaluarAnalisisFuente(
  ejercicio: AnalisisFuente,
  respuesta: RespuestaAnalisisFuente,
): ResultadoEvaluacion {
  const detalle: DetalleAnalisis[] = ejercicio.preguntas.map((pregunta) => {
    const elegida = pregunta.opciones.find((o) => o.id === respuesta.respuestas[pregunta.id]);
    const correctoPregunta = elegida?.esCorrecta === true;
    const opcionCorrecta = pregunta.opciones.find((o) => o.esCorrecta);
    const retro =
      elegida?.retro ??
      opcionCorrecta?.retro ??
      (correctoPregunta ? RETRO_ACIERTO_DEFECTO : RETRO_ERROR_DEFECTO);
    return { preguntaId: pregunta.id, correcto: correctoPregunta, retro };
  });
  const correcto = detalle.every((d) => d.correcto);
  return {
    correcto,
    retroalimentacion: ejercicio.retroalimentacion ?? RETRO_ACIERTO_DEFECTO,
    hint: correcto ? undefined : (ejercicio.retroalimentacion ?? HINT_DEFECTO),
    detalle,
  };
}

/**
 * Dispatcher tipado. El narrowing exige que `ejercicio.tipo === respuesta.tipo`;
 * si no coinciden, es un error en tiempo de compilación. El `switch` es
 * exhaustivo (los 7 tipos) y el `default` fuerza `never` para que agregar un
 * tipo nuevo rompa la compilación hasta cubrirlo.
 */
export function evaluarEjercicio(
  ejercicio: Ejercicio,
  respuesta: Respuesta,
): ResultadoEvaluacion {
  switch (ejercicio.tipo) {
    case 'opcion_multiple':
      return evaluarOpcionMultiple(ejercicio, respuesta as RespuestaOpcionMultiple);
    case 'verdadero_falso':
      return evaluarVerdaderoFalso(ejercicio, respuesta as RespuestaVerdaderoFalso);
    case 'emparejar':
      return evaluarEmparejar(ejercicio, respuesta as RespuestaEmparejar);
    case 'ordenar':
      return evaluarOrdenar(ejercicio, respuesta as RespuestaOrdenar);
    case 'completar':
      return evaluarCompletar(ejercicio, respuesta as RespuestaCompletar);
    case 'dilema':
      return evaluarDilema(ejercicio, respuesta as RespuestaDilema);
    case 'analisis_fuente':
      return evaluarAnalisisFuente(ejercicio, respuesta as RespuestaAnalisisFuente);
    default: {
      const _exhaustivo: never = ejercicio;
      return _exhaustivo;
    }
  }
}

/**
 * Un ejercicio es EVALUABLE si tiene veredicto correcto/incorrecto. El dilema no
 * lo es (R3.3): no bloquea la finalización ni cuenta como acierto/error.
 */
export function esEvaluable(ejercicio: Ejercicio): boolean {
  return ejercicio.tipo !== 'dilema';
}
