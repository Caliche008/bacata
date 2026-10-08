// STUB de validación de contenido.
// Recorre los archivos JSON bajo /content, confirma que cada uno es JSON
// válido e imprime OK. La validación por esquema (Zod) es la tarea 2.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import process from 'node:process';

const CONTENT_DIR = join(process.cwd(), 'content');

/**
 * Lista recursivamente todos los archivos .json bajo un directorio.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function findJsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
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

async function main() {
  let files;
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
    try {
      const raw = await readFile(file, 'utf8');
      JSON.parse(raw);
      console.log(`OK  ${rel}`);
    } catch (error) {
      hasError = true;
      console.error(`ERROR  ${rel}`);
      console.error(error instanceof Error ? error.message : error);
    }
  }

  if (hasError) {
    console.error('Validación de contenido FALLIDA.');
    process.exit(1);
  }

  console.log(`OK: ${files.length} archivo(s) de contenido válido(s).`);
}

main();
