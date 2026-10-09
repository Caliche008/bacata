import {
  getProgressForLesson,
  newEventId,
  putProgress,
  type Progreso,
} from '../../lib/storage';

/**
 * Wrapper del progreso de lección (tarea 9, R3.9/R3.4). Usa SOLO la API de
 * `src/lib/storage` (nunca IndexedDB directo) y respeta la minimización de datos
 * (Ley 1581): el progreso se asocia a `estudianteId` interno + `leccionId`, sin
 * PII; nunca lee ni registra `docentePinHash`.
 *
 * - `cargarProgresoLeccion`: lee el registro existente (para rehidratar `parcial`).
 * - `guardarParcial`: persiste el avance a mitad de lección (R3.9), sin penalizar.
 * - `marcarCompletada`: marca la lección completada (R3.4) con `completadaEn`.
 */

export async function cargarProgresoLeccion(
  estudianteId: string,
  leccionId: string,
): Promise<Progreso | undefined> {
  return getProgressForLesson(estudianteId, leccionId);
}

/**
 * Guarda el avance parcial (índice del ejercicio en curso). Reutiliza el `id` del
 * registro previo si existe para no duplicar; conserva `aciertos` previos. No
 * sobrescribe un registro ya `completada`.
 */
export async function guardarParcial(
  estudianteId: string,
  leccionId: string,
  indice: number,
  previo?: Progreso,
): Promise<void> {
  if (previo?.estado === 'completada') {
    return;
  }
  const registro: Progreso = {
    id: previo?.id ?? newEventId(),
    estudianteId,
    leccionId,
    estado: 'en_progreso',
    aciertos: previo?.aciertos ?? 0,
    parcial: indice,
    completadaEn: null,
  };
  await putProgress(registro);
}

/**
 * Marca la lección como completada (R3.4). Fija `completadaEn` (ISO 8601), guarda
 * los aciertos y limpia `parcial`. Reutiliza el `id` previo si existe.
 */
export async function marcarCompletada(
  estudianteId: string,
  leccionId: string,
  aciertos: number,
  previo?: Progreso,
): Promise<Progreso> {
  const registro: Progreso = {
    id: previo?.id ?? newEventId(),
    estudianteId,
    leccionId,
    estado: 'completada',
    aciertos,
    parcial: undefined,
    completadaEn: new Date().toISOString(),
  };
  await putProgress(registro);
  return registro;
}
