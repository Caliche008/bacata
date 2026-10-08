import type { Curso, Grado } from '../../content/types';
import { getDb } from './db';
import type { ContenidoCache } from './types';

/**
 * CRUD del store `contenidoCache`: contenido empaquetado + versión, keyeado por
 * `grado` (ver `plan-task4.md`, decisión 4). El loader de contenido (tarea 5)
 * trabaja un `Curso` por grado.
 */

export async function putCachedCourse(
  grado: Grado,
  version: string,
  curso: Curso,
): Promise<void> {
  const db = await getDb();
  await db.put('contenidoCache', { grado, version, curso });
}

export async function getCachedCourse(grado: Grado): Promise<ContenidoCache | undefined> {
  const db = await getDb();
  return db.get('contenidoCache', grado);
}

export async function getAllCachedCourses(): Promise<ContenidoCache[]> {
  const db = await getDb();
  return db.getAll('contenidoCache');
}

export async function deleteCachedCourse(grado: Grado): Promise<void> {
  const db = await getDb();
  await db.delete('contenidoCache', grado);
}
