import type { z } from 'zod';
import { cursoSchema } from '../../../content';
import type { Curso } from '../../../content/types';

/**
 * Export/import de un curso como JSON, con la misma forma que
 * `content/cursos/*.json`. Usa SOLO APIs del navegador (Blob, URL,
 * `<a download>`); sin dependencias nuevas. La validación reutiliza
 * `cursoSchema` (fuente única de la verdad), nunca redefine reglas.
 *
 * Los mensajes de error van en español (tono Bacatá) para que el docente los
 * entienda. No se registra nada en logs.
 */

/** Resultado de `exportarCurso`: no descarga si el curso es inválido. */
export interface ResultadoExportar {
  ok: boolean;
  errores?: string[];
}

/** Resultado de `importarCurso`: discriminado por `ok`. */
export type ResultadoImportar =
  | { ok: true; curso: Curso }
  | { ok: false; errores: string[] };

/** Convierte los issues de Zod en mensajes legibles "ruta: mensaje" en español. */
function mensajesDeIssues(issues: z.ZodIssue[]): string[] {
  return issues.map((issue) => {
    const ruta = issue.path.join('.');
    return ruta.length > 0 ? `${ruta}: ${issue.message}` : issue.message;
  });
}

/**
 * Valida `curso` con `cursoSchema`; si es válido, serializa con sangría de 2 y
 * dispara una descarga `grado-<grado>.json`. Si es inválido, NO descarga y
 * devuelve los errores en español.
 */
export function exportarCurso(curso: Curso): ResultadoExportar {
  const resultado = cursoSchema.safeParse(curso);
  if (!resultado.success) {
    return { ok: false, errores: mensajesDeIssues(resultado.error.issues) };
  }

  const json = JSON.stringify(resultado.data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `grado-${resultado.data.grado}.json`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }

  return { ok: true };
}

/**
 * Parsea `texto` como JSON y lo valida con `cursoSchema`. Nunca lanza: devuelve
 * `ok:false` con mensajes claros en español si el JSON está corrupto o no
 * cumple el esquema.
 */
export function importarCurso(texto: string): ResultadoImportar {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return {
      ok: false,
      errores: ['El archivo no es un JSON válido. Revisa que no esté dañado o incompleto.'],
    };
  }

  const resultado = cursoSchema.safeParse(datos);
  if (!resultado.success) {
    return { ok: false, errores: mensajesDeIssues(resultado.error.issues) };
  }

  return { ok: true, curso: resultado.data };
}
