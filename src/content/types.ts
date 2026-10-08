import type { z } from 'zod';
import type {
  gradoSchema,
  estadoContenidoSchema,
  fuenteSchema,
  metaSchema,
  opcionEvaluableSchema,
  opcionMultipleSchema,
  verdaderoFalsoSchema,
  emparejarSchema,
  ordenarSchema,
  completarSchema,
  dilemaSchema,
  analisisFuenteSchema,
  ejercicioSchema,
  leccionSchema,
  unidadSchema,
  cursoSchema,
} from './schema';

/**
 * Tipos del modelo de contenido de Bacatá.
 *
 * Se derivan por `z.infer` del esquema Zod (`schema.ts`), que es la fuente única
 * de la verdad. Así los tipos y la validación no pueden divergir. Reflejan el
 * "Modelo de contenido" de design.md.
 */

export type Grado = z.infer<typeof gradoSchema>;
export type EstadoContenido = z.infer<typeof estadoContenidoSchema>;
export type Fuente = z.infer<typeof fuenteSchema>;
export type Meta = z.infer<typeof metaSchema>;

/** Opción evaluable (opcion_multiple y preguntas de analisis_fuente). */
export type OpcionEvaluable = z.infer<typeof opcionEvaluableSchema>;

export type OpcionMultiple = z.infer<typeof opcionMultipleSchema>;
export type VerdaderoFalso = z.infer<typeof verdaderoFalsoSchema>;
export type Emparejar = z.infer<typeof emparejarSchema>;
export type Ordenar = z.infer<typeof ordenarSchema>;
export type Completar = z.infer<typeof completarSchema>;
export type Dilema = z.infer<typeof dilemaSchema>;
export type AnalisisFuente = z.infer<typeof analisisFuenteSchema>;

/** Unión discriminada por `tipo`. */
export type Ejercicio = z.infer<typeof ejercicioSchema>;

/**
 * `Base`: campos comunes a todo ejercicio (id, enunciado, retroalimentacion?, meta).
 * No existe un esquema `Base` independiente porque Zod compone los campos en cada
 * variante; este tipo se expresa como los campos comunes de la unión.
 */
export type Base = Pick<Ejercicio, 'id' | 'enunciado' | 'retroalimentacion' | 'meta'>;

export type Leccion = z.infer<typeof leccionSchema>;
export type Unidad = z.infer<typeof unidadSchema>;
export type Curso = z.infer<typeof cursoSchema>;
