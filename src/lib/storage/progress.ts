import { getDb } from './db';
import type { Progreso } from './types';

/** CRUD del store `progreso`. Todo progreso se escribe local primero (R5.3). */

export async function putProgress(p: Progreso): Promise<string> {
  const db = await getDb();
  return db.put('progreso', p);
}

export async function getProgress(id: string): Promise<Progreso | undefined> {
  const db = await getDb();
  return db.get('progreso', id);
}

export async function getProgressByStudent(estudianteId: string): Promise<Progreso[]> {
  const db = await getDb();
  return db.getAllFromIndex('progreso', 'porEstudiante', estudianteId);
}

export async function getProgressForLesson(
  estudianteId: string,
  leccionId: string,
): Promise<Progreso | undefined> {
  const db = await getDb();
  return db.getFromIndex('progreso', 'porLeccion', [estudianteId, leccionId]);
}

export async function deleteProgress(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('progreso', id);
}
