import { getDb } from './db';
import type { PerfilEstudiante } from './types';

/** CRUD del store `perfilEstudiante` (sin PII — R1, R8.1). */

export async function putProfile(profile: PerfilEstudiante): Promise<string> {
  const db = await getDb();
  return db.put('perfilEstudiante', profile);
}

export async function getProfile(id: string): Promise<PerfilEstudiante | undefined> {
  const db = await getDb();
  return db.get('perfilEstudiante', id);
}

export async function getAllProfiles(): Promise<PerfilEstudiante[]> {
  const db = await getDb();
  return db.getAll('perfilEstudiante');
}

export async function getProfilesByClassCode(codigoClase: string): Promise<PerfilEstudiante[]> {
  const db = await getDb();
  return db.getAllFromIndex('perfilEstudiante', 'porCodigoClase', codigoClase);
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('perfilEstudiante', id);
}
