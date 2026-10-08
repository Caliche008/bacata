import { getDb } from './db';
import type { Gamificacion } from './types';

/** CRUD del store `gamificacion` (XP, racha, logros). */

export async function putGamification(g: Gamificacion): Promise<string> {
  const db = await getDb();
  return db.put('gamificacion', g);
}

export async function getGamification(estudianteId: string): Promise<Gamificacion | undefined> {
  const db = await getDb();
  return db.get('gamificacion', estudianteId);
}

export async function deleteGamification(estudianteId: string): Promise<void> {
  const db = await getDb();
  await db.delete('gamificacion', estudianteId);
}
