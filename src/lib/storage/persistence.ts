/**
 * Helpers de almacenamiento persistente y cuota (R5.6, offline-first).
 *
 * Todos son defensivos: si la Storage API no existe (p. ej. entornos de prueba
 * o navegadores antiguos), no lanzan y devuelven un valor neutro.
 */

/** `navigator.storage` si está disponible. */
function getStorageManager(): StorageManager | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }
  return navigator.storage;
}

/**
 * Solicita almacenamiento persistente. Devuelve el resultado de
 * `navigator.storage.persist()` si existe; si no, `false` (sin lanzar).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  const storage = getStorageManager();
  if (!storage?.persist) {
    return false;
  }
  try {
    return await storage.persist();
  } catch {
    return false;
  }
}

/**
 * Indica si el almacenamiento ya es persistente. `false` si la API no existe o
 * falla.
 */
export async function isStoragePersisted(): Promise<boolean> {
  const storage = getStorageManager();
  if (!storage?.persisted) {
    return false;
  }
  try {
    return await storage.persisted();
  } catch {
    return false;
  }
}

/**
 * Consulta uso y cuota estimados. Normaliza `usage`/`quota` a 0 si vienen
 * `undefined`. Devuelve `null` si la API no existe o falla.
 */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  const storage = getStorageManager();
  if (!storage?.estimate) {
    return null;
  }
  try {
    const { usage, quota } = await storage.estimate();
    return { usage: usage ?? 0, quota: quota ?? 0 };
  } catch {
    return null;
  }
}
