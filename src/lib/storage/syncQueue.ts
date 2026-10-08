import { getDb } from './db';
import { newEventId } from './ids';
import type { SyncEvent } from './types';

/**
 * API mínima de la cola de sincronización (`colaSync`).
 *
 * PREPARADA para Fase 2, INACTIVA en el MVP: solo almacena, lee y borra
 * eventos. No hay lógica de envío ni de reconciliación aquí. Los `id` de evento
 * son idempotentes (uuid vía `newEventId`) para que un reintento de Fase 2 no
 * duplique eventos.
 */

/**
 * Encola un evento. Si no se provee `id`, se genera uno idempotente. Como el
 * keyPath es `id`, reencolar un evento con el mismo `id` reemplaza en lugar de
 * duplicar. Devuelve el `id` usado.
 */
export async function enqueueSyncEvent(
  evento: Omit<SyncEvent, 'id'> & { id?: string },
): Promise<string> {
  const db = await getDb();
  const record: SyncEvent = { ...evento, id: evento.id ?? newEventId() };
  await db.put('colaSync', record);
  return record.id;
}

export async function getSyncQueue(): Promise<SyncEvent[]> {
  const db = await getDb();
  return db.getAll('colaSync');
}

export async function getSyncQueueByStudent(estudianteId: string): Promise<SyncEvent[]> {
  const db = await getDb();
  return db.getAllFromIndex('colaSync', 'porEstudiante', estudianteId);
}

export async function deleteSyncEvent(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('colaSync', id);
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDb();
  await db.clear('colaSync');
}
