import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type {
  ClaseLocal,
  ContenidoCache,
  Gamificacion,
  PerfilEstudiante,
  Progreso,
  Repaso,
  SyncEvent,
} from './types';

/**
 * Esquema y apertura de la base de datos local (IndexedDB) de Bacatá.
 *
 * Wrapper elegido: `idb` (ver `plan-task4.md`, decisión 1) — minúsculo, refleja
 * la API nativa de IndexedDB y ofrece tipado fuerte vía `DBSchema`, lo que
 * encaja con "TS estricto sin `any`" y "dependencias livianas" de `tech.md`.
 *
 * Esta capa aísla IndexedDB: el resto de la app nunca habla con IndexedDB
 * directamente, solo a través de la API pública de `src/lib/storage`.
 */

export const DB_NAME = 'bacata';
export const DB_VERSION = 1;

/**
 * Contrato de stores, keyPaths e índices (ver `design.md` →
 * "Modelo de datos local (IndexedDB)" y la tabla en `plan-task4.md`).
 */
export interface BacataDB extends DBSchema {
  perfilEstudiante: {
    key: string;
    value: PerfilEstudiante;
    indexes: { porCodigoClase: string };
  };
  progreso: {
    key: string;
    value: Progreso;
    indexes: {
      porEstudiante: string;
      porLeccion: [string, string];
    };
  };
  gamificacion: {
    key: string;
    value: Gamificacion;
  };
  repaso: {
    key: string;
    value: Repaso;
    indexes: { porEstudiante: string };
  };
  contenidoCache: {
    key: number;
    value: ContenidoCache;
  };
  clasesLocales: {
    key: string;
    value: ClaseLocal;
    indexes: { porCodigo: string };
  };
  colaSync: {
    key: string;
    value: SyncEvent;
    indexes: { porEstudiante: string };
  };
}

/**
 * Crea todos los stores e índices. Usa `switch (oldVersion)` con fall-through
 * intencional para poder añadir migraciones futuras sin reescribir el bloque
 * de la versión 1.
 */
function upgrade(db: IDBPDatabase<BacataDB>, oldVersion: number): void {
  switch (oldVersion) {
    case 0: {
      const perfiles = db.createObjectStore('perfilEstudiante', { keyPath: 'id' });
      perfiles.createIndex('porCodigoClase', 'codigoClase');

      const progreso = db.createObjectStore('progreso', { keyPath: 'id' });
      progreso.createIndex('porEstudiante', 'estudianteId');
      progreso.createIndex('porLeccion', ['estudianteId', 'leccionId'], { unique: true });

      db.createObjectStore('gamificacion', { keyPath: 'estudianteId' });

      const repaso = db.createObjectStore('repaso', { keyPath: 'id' });
      repaso.createIndex('porEstudiante', 'estudianteId');

      db.createObjectStore('contenidoCache', { keyPath: 'grado' });

      const clases = db.createObjectStore('clasesLocales', { keyPath: 'id' });
      clases.createIndex('porCodigo', 'codigo', { unique: true });

      const colaSync = db.createObjectStore('colaSync', { keyPath: 'id' });
      colaSync.createIndex('porEstudiante', 'estudianteId');
    }
    // fall-through: futuras versiones añaden sus migraciones aquí (case 1, 2, ...).
  }
}

let dbPromise: Promise<IDBPDatabase<BacataDB>> | null = null;

/** Abre (o reutiliza) la conexión a la BD. Memoiza la promesa. */
export function getDb(): Promise<IDBPDatabase<BacataDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BacataDB>(DB_NAME, DB_VERSION, { upgrade });
  }
  return dbPromise;
}

/** Cierra la conexión y olvida la promesa memoizada. */
export async function closeDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

/**
 * Reinicia el estado memoizado (sin borrar datos). Útil en pruebas para forzar
 * una reapertura tras recrear la `IDBFactory`.
 */
export function resetDb(): void {
  dbPromise = null;
}
