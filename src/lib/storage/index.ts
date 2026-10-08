/**
 * API pública de la capa de almacenamiento local (IndexedDB).
 *
 * El resto de la app importa SOLO desde aquí: IndexedDB queda aislado tras esta
 * capa (ningún otro módulo habla con IndexedDB directamente). Esta capa no
 * conoce React.
 */

// Tipos del modelo de datos local.
export type {
  EstadoProgreso,
  PerfilEstudiante,
  Progreso,
  Gamificacion,
  Repaso,
  ContenidoCache,
  ClaseLocal,
  SyncEvent,
  SyncPayload,
  SyncValue,
} from './types';

// Esquema / ciclo de vida de la BD (útil sobre todo para pruebas y arranque).
export { DB_NAME, DB_VERSION, getDb, closeDb, resetDb } from './db';
export type { BacataDB } from './db';

// Ids idempotentes.
export { newEventId } from './ids';

// CRUD por store.
export {
  putProfile,
  getProfile,
  getAllProfiles,
  getProfilesByClassCode,
  deleteProfile,
} from './profiles';
export {
  putProgress,
  getProgress,
  getProgressByStudent,
  getProgressForLesson,
  deleteProgress,
} from './progress';
export { putGamification, getGamification, deleteGamification } from './gamification';
export {
  reviewId,
  putReview,
  getReview,
  getReviewByStudent,
  deleteReview,
} from './review';
export {
  putCachedCourse,
  getCachedCourse,
  getAllCachedCourses,
  deleteCachedCourse,
} from './contentCache';
export {
  putClass,
  getClass,
  getClassByCode,
  getAllClasses,
  deleteClass,
} from './classes';
export {
  enqueueSyncEvent,
  getSyncQueue,
  getSyncQueueByStudent,
  deleteSyncEvent,
  clearSyncQueue,
} from './syncQueue';

// Borrado (derecho de supresión — Ley 1581).
export { deleteStudentData, deleteClassData } from './deletion';

// Persistencia y cuota.
export {
  requestPersistentStorage,
  isStoragePersisted,
  getStorageEstimate,
} from './persistence';
