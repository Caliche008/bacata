import type { Curso, Grado } from '../../content/types';

/**
 * Tipos de los records que persiste la capa de almacenamiento local (IndexedDB).
 *
 * El CONTRATO de nombres de stores y campos lo fija `design.md`
 * ("Modelo de datos local (IndexedDB)") y está en español. Los símbolos de
 * código (tipos, funciones, archivos) van en inglés, como exige `tech.md`.
 *
 * Privacidad por diseño (Ley 1581): el modelo solo guarda `apodo` + un id
 * interno del estudiante, nunca PII. `docentePinHash` es un secreto y jamás
 * debe registrarse en logs.
 */

/** Estado de una lección en el progreso del estudiante. */
export type EstadoProgreso = 'en_progreso' | 'completada';

/** Perfil del estudiante — sin PII (R1, R8.1). */
export interface PerfilEstudiante {
  id: string;
  apodo: string;
  codigoClase: string;
  grado: Grado;
  /** Fecha de creación en ISO 8601. */
  creadoEn: string;
}

/** Progreso por lección (`parcial` guarda avance a mitad de lección — R3.9). */
export interface Progreso {
  id: string;
  estudianteId: string;
  leccionId: string;
  estado: EstadoProgreso;
  aciertos: number;
  /** Avance parcial opcional (p. ej. índice del ejercicio en curso). */
  parcial?: number;
  /** ISO 8601 cuando se completó; `null` mientras está en progreso. */
  completadaEn: string | null;
}

/** Gamificación del estudiante (XP, racha, logros). */
export interface Gamificacion {
  estudianteId: string;
  xp: number;
  rachaActual: number;
  mejorRacha: number;
  /** Fecha local de la última actividad en formato `YYYY-MM-DD`. */
  ultimaFechaActiva: string;
  /** Ids de logros obtenidos. */
  logros: string[];
}

/**
 * Repaso de errores (R14). `design.md` lista
 * `{ estudianteId, ejercicioId, fallos, proximaAparicion }`; se añade un `id`
 * sintético `` `${estudianteId}:${ejercicioId}` `` como keyPath para get/put
 * directos. `proximaAparicion` es un timestamp epoch en ms.
 */
export interface Repaso {
  id: string;
  estudianteId: string;
  ejercicioId: string;
  fallos: number;
  proximaAparicion: number;
}

/** Contenido empaquetado cacheado + su versión, por grado. */
export interface ContenidoCache {
  grado: Grado;
  version: string;
  curso: Curso;
}

/** Clase local gestionada por el panel docente (modo local). */
export interface ClaseLocal {
  id: string;
  codigo: string;
  unidadesActivas: string[];
  /** Hash del PIN/clave del docente. Secreto: nunca registrar en logs. */
  docentePinHash: string;
}

/**
 * Carga de un evento de sincronización. La cola solo almacena; la semántica de
 * cada tipo se define en Fase 2. Se tipa como un valor JSON-serializable, sin
 * `any`.
 */
export type SyncValue =
  | string
  | number
  | boolean
  | null
  | SyncValue[]
  | { [key: string]: SyncValue };
export type SyncPayload = Record<string, SyncValue>;

/**
 * Evento de la cola de sincronización (`colaSync`). Preparada para Fase 2,
 * INACTIVA en el MVP. El `id` es idempotente (uuid) para que un reintento no
 * duplique eventos.
 */
export interface SyncEvent {
  id: string;
  estudianteId: string;
  tipo: string;
  payload: SyncPayload;
  /** ISO 8601 de creación del evento. */
  creadoEn: string;
}
