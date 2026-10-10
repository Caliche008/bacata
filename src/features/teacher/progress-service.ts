/**
 * Progreso agregado por clase para el panel docente (R6.2). Lógica de lectura
 * (storage) + agregación pura, sin React.
 *
 * PRIVACIDAD (Ley 1581, R8.1): el resumen expone ÚNICAMENTE el apodo y un id
 * interno del estudiante, más sus porcentajes de avance. NUNCA incluye PII ni
 * `docentePinHash`. Reutiliza `porcentajeUnidad`/`leccionesCompletadas` de la
 * ruta del estudiante para no duplicar las reglas de progreso.
 */

import type { Curso } from '../../content';
import { listarLecciones, listarUnidades } from '../../content';
import { getProfilesByClassCode, getProgressByStudent } from '../../lib/storage';
import { leccionesCompletadas, porcentajeUnidad } from '../lessons';

/** Avance de un estudiante en una unidad concreta. */
export interface AvanceUnidad {
  unidadId: string;
  titulo: string;
  /** Cátedra de la Paz como eje transversal (se muestra con icono+texto). */
  ejePaz: boolean;
  porcentaje: number;
  completadas: number;
  total: number;
}

/** Resumen de un estudiante: SOLO apodo + id interno + avance. Sin PII. */
export interface ResumenEstudiante {
  estudianteId: string;
  apodo: string;
  porUnidad: AvanceUnidad[];
  leccionesCompletadas: number;
  totalLecciones: number;
}

/**
 * Construye el resumen de progreso de todos los estudiantes de una clase, para
 * el curso del grado indicado. Lee perfiles por código de clase y, por
 * estudiante, su progreso. El resultado nunca contiene PII ni el hash docente.
 */
export async function resumenClase(
  codigoClase: string,
  curso: Curso,
): Promise<ResumenEstudiante[]> {
  const perfiles = await getProfilesByClassCode(codigoClase);
  const unidades = listarUnidades(curso);
  const totalLecciones = unidades.reduce(
    (suma, unidad) => suma + listarLecciones(unidad).length,
    0,
  );

  const resumenes = await Promise.all(
    perfiles.map(async (perfil): Promise<ResumenEstudiante> => {
      const progreso = await getProgressByStudent(perfil.id);
      const completadas = leccionesCompletadas(progreso);

      const porUnidad: AvanceUnidad[] = unidades.map((unidad) => {
        const lecciones = listarLecciones(unidad);
        const hechas = lecciones.filter((leccion) => completadas.has(leccion.id)).length;
        return {
          unidadId: unidad.id,
          titulo: unidad.titulo,
          ejePaz: unidad.ejePaz,
          porcentaje: porcentajeUnidad(unidad, completadas),
          completadas: hechas,
          total: lecciones.length,
        };
      });

      const leccionesHechas = porUnidad.reduce((suma, u) => suma + u.completadas, 0);

      // Se construye explícitamente el objeto para garantizar que NO se filtra
      // ningún otro campo del perfil (aunque hoy el perfil no tenga PII).
      return {
        estudianteId: perfil.id,
        apodo: perfil.apodo,
        porUnidad,
        leccionesCompletadas: leccionesHechas,
        totalLecciones,
      };
    }),
  );

  return resumenes;
}
