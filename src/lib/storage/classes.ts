import { getDb } from './db';
import type { ClaseLocal } from './types';

/**
 * CRUD del store `clasesLocales` (panel docente, modo local).
 *
 * `docentePinHash` es un secreto: esta capa nunca lo registra en logs (R8.6).
 */

export async function putClass(c: ClaseLocal): Promise<string> {
  const db = await getDb();
  return db.put('clasesLocales', c);
}

export async function getClass(id: string): Promise<ClaseLocal | undefined> {
  const db = await getDb();
  return db.get('clasesLocales', id);
}

export async function getClassByCode(codigo: string): Promise<ClaseLocal | undefined> {
  const db = await getDb();
  return db.getFromIndex('clasesLocales', 'porCodigo', codigo);
}

export async function getAllClasses(): Promise<ClaseLocal[]> {
  const db = await getDb();
  return db.getAll('clasesLocales');
}

export async function deleteClass(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('clasesLocales', id);
}
