// Validación de contenido de Bacatá contra el esquema Zod (fuente única de la verdad).
//
// Recorre recursivamente los JSON bajo /content, valida cada curso contra
// `cursoSchema` e imprime un reporte claro:
//  - En éxito: OK <archivo> + resumen (unidades/lecciones/ejercicios).
//  - En error: por cada problema, archivo + ruta del campo + mensaje; sale con código 1.
//
// Se ejecuta con `tsx` (ver package.json) para compartir el esquema TS sin duplicarlo.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import process from 'node:process';
import { cursoSchema } from '../src/content/schema.ts';
import type { Curso } from '../src/content/types.ts';

const CONTENT_DIR = join(process.cwd(), 'content');

/** Lista recursivamente todos los archivos .json bajo un directorio. */
async function findJsonFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJsonFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

/** Cuenta lecciones y ejercicios de un curso para el resumen. */
function resumen(curso: Curso): { unidades: number; lecciones: number; ejercicios: number } {
  let lecciones = 0;
  let ejercicios = 0;
  for (const unidad of curso.unidades) {
    lecciones += unidad.lecciones.length;
    for (const leccion of unidad.lecciones) {
      ejercicios += leccion.ejercicios.length;
    }
  }
  return { unidades: curso.unidades.length, lecciones, ejercicios };
}

/** Avisa (sin fallar) sobre contenido en borrador: solo `aprobado` entra a la app (R7.8). */
function avisarBorradores(curso: Curso, rel: string): void {
  for (const unidad of curso.unidades) {
    for (const leccion of unidad.lecciones) {
      for (const ejercicio of leccion.ejercicios) {
        if (ejercicio.meta.estado === 'borrador') {
          console.warn(
            `AVISO  ${rel}: ejercicio "${ejercicio.id}" está en borrador y no se incluirá en la app.`,
          );
        }
      }
    }
  }
}

async function main(): Promise<void> {
  let files: string[];
  try {
    files = await findJsonFiles(CONTENT_DIR);
  } catch (error) {
    console.error(`No se pudo leer el directorio de contenido: ${CONTENT_DIR}`);
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No se encontraron archivos JSON en ${CONTENT_DIR}`);
    process.exit(1);
  }

  let hasError = false;
  for (const file of files) {
    const rel = relative(process.cwd(), file);

    let datos: unknown;
    try {
      datos = JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      hasError = true;
      console.error(`ERROR  ${rel}: JSON inválido`);
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const resultado = cursoSchema.safeParse(datos);
    if (!resultado.success) {
      hasError = true;
      console.error(`ERROR  ${rel}: no cumple el esquema de contenido`);
      for (const issue of resultado.error.issues) {
        const ruta = issue.path.length > 0 ? issue.path.join('.') : '(raíz)';
        console.error(`  ${ruta}: ${issue.message}`);
      }
      continue;
    }

    const { unidades, lecciones, ejercicios } = resumen(resultado.data);
    console.log(
      `OK  ${rel}  (${unidades} unidad(es), ${lecciones} lección(es), ${ejercicios} ejercicio(s))`,
    );
    avisarBorradores(resultado.data, rel);
  }

  if (hasError) {
    console.error('Validación de contenido FALLIDA.');
    process.exit(1);
  }

  console.log(`OK: ${files.length} archivo(s) de contenido válido(s) contra el esquema.`);
}

main();
