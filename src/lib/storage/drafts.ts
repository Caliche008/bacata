import type { Grado } from '../../content/types';
import { getDb } from './db';
import type { BorradorContenido } from './types';

/**
 * CRUD del store `borradoresContenido` (editor de contenido local del docente).
 *
 * Un borrador guarda un `Curso` que puede estar incompleto mientras se edita;
 * esta capa NO valida ni filtra el contenido al persistir. El contenido
 * pedagógico no es PII; aun así esta capa nunca registra nada en logs.
 */

export async function putDraft(b: BorradorContenido): Promise<string> {
  const db = await getDb();
  return db.put('borradoresContenido', b);
}

export async function getDraft(id: string): Promise<BorradorContenido | undefined> {
  const db = await getDb();
  return db.get('borradoresContenido', id);
}

export async function getAllDrafts(): Promise<BorradorContenido[]> {
  const db = await getDb();
  return db.getAll('borradoresContenido');
}

export async function getDraftsByGrade(grado: Grado): Promise<BorradorContenido[]> {
  const db = await getDb();
  return db.getAllFromIndex('borradoresContenido', 'porGrado', grado);
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('borradoresContenido', id);
}
