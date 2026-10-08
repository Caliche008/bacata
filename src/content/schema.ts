import { z } from 'zod';

/**
 * Esquema de contenido pedagógico de Bacatá (fuente única de la verdad).
 *
 * Refleja el "Modelo de contenido" de design.md y las reglas de contenido.md.
 * Los tipos TypeScript se derivan por `z.infer` (ver `types.ts`), de modo que
 * tipos y esquema no pueden contradecirse.
 *
 * Nota: los nombres de los campos del modelo se mantienen en español porque son
 * el CONTRATO de datos de design.md y del contenido semilla (`grado-6.json`).
 */

const noVacio = (campo: string) => z.string().min(1, `${campo} no puede estar vacío`);

/** Grado = 6 | 7 */
export const gradoSchema = z.union([z.literal(6), z.literal(7)]);

/** EstadoContenido = 'borrador' | 'aprobado' (R7.8) */
export const estadoContenidoSchema = z.enum(['borrador', 'aprobado']);

/** Fuente de un hecho o documento (R3.8) */
export const fuenteSchema = z
  .object({
    titulo: noVacio('El título de la fuente'),
    autor: z.string().optional(),
    url: z.string().url('La url de la fuente debe ser válida').optional(),
    anio: z.number().int('El año debe ser un entero').optional(),
  })
  .strict();

/** Metadatos por ejercicio (R7.7) */
export const metaSchema = z
  .object({
    tema: noVacio('El tema'),
    etiquetas: z.array(z.string()),
    fuente: fuenteSchema.optional(),
    sensible: z.boolean().optional(),
    notaContexto: z.string().optional(),
    estado: estadoContenidoSchema,
  })
  .strict();

/** Campos comunes a todo ejercicio */
const baseFields = {
  id: noVacio('El id del ejercicio'),
  enunciado: noVacio('El enunciado'),
  retroalimentacion: z.string().optional(),
  meta: metaSchema,
};

/** Opción evaluable, usada en opcion_multiple y en las preguntas de analisis_fuente */
export const opcionEvaluableSchema = z
  .object({
    id: noVacio('El id de la opción'),
    texto: noVacio('El texto de la opción'),
    esCorrecta: z.boolean(),
    retro: z.string().optional(),
  })
  .strict();

export const opcionMultipleSchema = z
  .object({
    ...baseFields,
    tipo: z.literal('opcion_multiple'),
    opciones: z.array(opcionEvaluableSchema).min(1, 'Debe haber al menos una opción'),
  })
  .strict();

export const verdaderoFalsoSchema = z
  .object({
    ...baseFields,
    tipo: z.literal('verdadero_falso'),
    respuestaCorrecta: z.boolean(),
    justificacion: noVacio('La justificación'),
  })
  .strict();

export const emparejarSchema = z
  .object({
    ...baseFields,
    tipo: z.literal('emparejar'),
    pares: z
      .array(
        z
          .object({
            izquierda: noVacio('El lado izquierdo del par'),
            derecha: noVacio('El lado derecho del par'),
          })
          .strict(),
      )
      .min(1, 'Debe haber al menos un par'),
  })
  .strict();

export const ordenarSchema = z
  .object({
    ...baseFields,
    tipo: z.literal('ordenar'),
    elementos: z
      .array(
        z
          .object({
            id: noVacio('El id del elemento'),
            texto: noVacio('El texto del elemento'),
            orden: z.number().int('El orden debe ser un entero'),
          })
          .strict(),
      )
      .min(1, 'Debe haber al menos un elemento'),
  })
  .strict();

export const completarSchema = z
  .object({
    ...baseFields,
    tipo: z.literal('completar'),
    texto: noVacio('El texto a completar'),
    huecos: z
      .array(
        z
          .object({
            id: noVacio('El id del hueco'),
            opciones: z.array(z.string()).min(1, 'Cada hueco necesita al menos una opción'),
            correcta: noVacio('La opción correcta del hueco'),
          })
          .strict(),
      )
      .min(1, 'Debe haber al menos un hueco'),
  })
  .strict();

/**
 * dilema: sin respuesta correcta (R3.3). Cada opción lleva una `reflexion`.
 * `.strict()` en la opción impide colar un campo de respuesta correcta (p. ej. `esCorrecta`).
 */
export const dilemaSchema = z
  .object({
    ...baseFields,
    tipo: z.literal('dilema'),
    escenario: noVacio('El escenario del dilema'),
    opciones: z
      .array(
        z
          .object({
            id: noVacio('El id de la opción'),
            texto: noVacio('El texto de la opción'),
            reflexion: noVacio('La reflexión de la opción'),
          })
          .strict(),
      )
      .min(1, 'Debe haber al menos una opción'),
  })
  .strict();

/** Recurso de analisis_fuente: texto, o imagen con `alt` obligatorio y no vacío (accesibilidad) */
export const recursoFuenteSchema = z.discriminatedUnion('clase', [
  z
    .object({
      clase: z.literal('texto'),
      contenido: noVacio('El contenido del recurso de texto'),
    })
    .strict(),
  z
    .object({
      clase: z.literal('imagen'),
      src: noVacio('El src de la imagen'),
      alt: noVacio('El texto alternativo (alt) de la imagen'),
    })
    .strict(),
]);

export const analisisFuenteSchema = z
  .object({
    ...baseFields,
    tipo: z.literal('analisis_fuente'),
    recurso: recursoFuenteSchema,
    preguntas: z
      .array(
        z
          .object({
            id: noVacio('El id de la pregunta'),
            pregunta: noVacio('El texto de la pregunta'),
            opciones: z
              .array(opcionEvaluableSchema)
              .min(1, 'Cada pregunta necesita al menos una opción'),
          })
          .strict(),
      )
      .min(1, 'Debe haber al menos una pregunta'),
  })
  .strict();

/**
 * Ejercicio = unión discriminada por `tipo`.
 * Un `tipo` desconocido produce un error de unión discriminada claro.
 */
const ejercicioBaseSchema = z.discriminatedUnion('tipo', [
  opcionMultipleSchema,
  verdaderoFalsoSchema,
  emparejarSchema,
  ordenarSchema,
  completarSchema,
  dilemaSchema,
  analisisFuenteSchema,
]);

/**
 * Regla transversal (R3.2, R3.6): todo ejercicio evaluable debe tener
 * retroalimentación formativa disponible, bien a nivel de ejercicio
 * (`retroalimentacion`), bien en sus opciones/preguntas/justificación.
 * `dilema` no es evaluable: su retroalimentación formativa es la `reflexion`
 * por opción (ya obligatoria), así que no se le exige `retroalimentacion`.
 */
function tieneRetroEnOpciones(opciones: { retro?: string }[]): boolean {
  return opciones.length > 0 && opciones.every((o) => (o.retro ?? '').trim().length > 0);
}

export const ejercicioSchema = ejercicioBaseSchema.superRefine((ejercicio, ctx) => {
  const retroEjercicio = (ejercicio.retroalimentacion ?? '').trim().length > 0;

  const faltaRetro = (): boolean => {
    switch (ejercicio.tipo) {
      case 'opcion_multiple':
        return !retroEjercicio && !tieneRetroEnOpciones(ejercicio.opciones);
      case 'verdadero_falso':
        // la justificacion (obligatoria) ya es retroalimentación formativa
        return false;
      case 'analisis_fuente':
        return (
          !retroEjercicio && !ejercicio.preguntas.every((p) => tieneRetroEnOpciones(p.opciones))
        );
      case 'emparejar':
      case 'ordenar':
      case 'completar':
        return !retroEjercicio;
      case 'dilema':
        return false;
    }
  };

  if (faltaRetro()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'El ejercicio evaluable debe tener retroalimentación formativa (en el ejercicio o en cada opción/pregunta).',
      path: ['retroalimentacion'],
    });
  }
});

export const leccionSchema = z
  .object({
    id: noVacio('El id de la lección'),
    titulo: noVacio('El título de la lección'),
    objetivoAprendizaje: noVacio('El objetivo de aprendizaje'),
    competencia: noVacio('La competencia'),
    orden: z.number().int('El orden debe ser un entero'),
    ejercicios: z.array(ejercicioSchema),
  })
  .strict();

/** Unidad: exige `ejePaz` y `catedraPaz` (R12.1, R12.2, R7.3) */
export const unidadSchema = z
  .object({
    id: noVacio('El id de la unidad'),
    titulo: noVacio('El título de la unidad'),
    descripcion: noVacio('La descripción de la unidad'),
    orden: z.number().int('El orden debe ser un entero'),
    objetivos: z.array(z.string()),
    ejePaz: z.boolean(),
    catedraPaz: z
      .object({
        tematicas: z.array(z.string()).min(1, 'catedraPaz debe declarar al menos una temática'),
        como: noVacio('catedraPaz.como'),
      })
      .strict(),
    lecciones: z.array(leccionSchema),
  })
  .strict();

export const cursoSchema = z
  .object({
    id: noVacio('El id del curso'),
    grado: gradoSchema,
    area: z.literal('ciencias_sociales'),
    titulo: noVacio('El título del curso'),
    descripcion: noVacio('La descripción del curso'),
    version: noVacio('La versión del contenido'),
    unidades: z.array(unidadSchema),
  })
  .strict();
