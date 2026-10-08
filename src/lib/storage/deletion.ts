import { getDb } from './db';
import { getClass, deleteClass } from './classes';
import { getProfilesByClassCode } from './profiles';

/**
 * Borrado de datos (derecho de supresión — Ley 1581 de 2012, R8.3).
 *
 * Deja la BD sin rastro del estudiante o de la clase indicados. Es verificable:
 * tras `deleteStudentData`, los `getAll*`/índices del estudiante devuelven vacío;
 * tras `deleteClassData`, también desaparecen la clase y sus estudiantes.
 */

/**
 * Borra TODOS los datos de un estudiante en una sola transacción `readwrite`
 * sobre los stores afectados: perfil, progreso, gamificación, repaso y los
 * eventos de la cola de sync asociados.
 */
export async function deleteStudentData(estudianteId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    ['perfilEstudiante', 'progreso', 'gamificacion', 'repaso', 'colaSync'],
    'readwrite',
  );

  const perfiles = tx.objectStore('perfilEstudiante');
  const progreso = tx.objectStore('progreso');
  const gamificacion = tx.objectStore('gamificacion');
  const repaso = tx.objectStore('repaso');
  const colaSync = tx.objectStore('colaSync');

  const [progresoKeys, repasoKeys, syncKeys] = await Promise.all([
    progreso.index('porEstudiante').getAllKeys(estudianteId),
    repaso.index('porEstudiante').getAllKeys(estudianteId),
    colaSync.index('porEstudiante').getAllKeys(estudianteId),
  ]);

  await Promise.all([
    perfiles.delete(estudianteId),
    gamificacion.delete(estudianteId),
    ...progresoKeys.map((key) => progreso.delete(key)),
    ...repasoKeys.map((key) => repaso.delete(key)),
    ...syncKeys.map((key) => colaSync.delete(key)),
  ]);

  await tx.done;
}

/**
 * Borra una clase y todos sus estudiantes. Resuelve la clase por su `id`, busca
 * los perfiles por el `codigo` de la clase (índice `porCodigoClase`), borra los
 * datos de cada estudiante y, por último, el record de la clase.
 */
export async function deleteClassData(claseId: string): Promise<void> {
  const clase = await getClass(claseId);
  if (!clase) {
    return;
  }

  const estudiantes = await getProfilesByClassCode(clase.codigo);
  for (const estudiante of estudiantes) {
    await deleteStudentData(estudiante.id);
  }

  await deleteClass(claseId);
}
