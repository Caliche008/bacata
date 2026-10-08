import { getDb } from './db';
import type { Repaso } from './types';

/**
 * CRUD del store `repaso` (repaso de errores — R14).
 *
 * El keyPath es el `id` sintético `` `${estudianteId}:${ejercicioId}` ``; este
 * helper lo construye para que los llamadores trabajen con la pareja natural
 * (estudiante, ejercicio).
 */

/** Construye el id sintético de un record de repaso. */
export function reviewId(estudianteId: string, ejercicioId: string): string {
  return `${estudianteId}:${ejercicioId}`;
}

export async function putReview(r: Repaso): Promise<string> {
  const db = await getDb();
  return db.put('repaso', r);
}

export async function getReview(
  estudianteId: string,
  ejercicioId: string,
): Promise<Repaso | undefined> {
  const db = await getDb();
  return db.get('repaso', reviewId(estudianteId, ejercicioId));
}

export async function getReviewByStudent(estudianteId: string): Promise<Repaso[]> {
  const db = await getDb();
  return db.getAllFromIndex('repaso', 'porEstudiante', estudianteId);
}

export async function deleteReview(estudianteId: string, ejercicioId: string): Promise<void> {
  const db = await getDb();
  await db.delete('repaso', reviewId(estudianteId, ejercicioId));
}
