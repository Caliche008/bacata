/**
 * Gestión de perfiles de estudiante por el docente (R6.6): renombrar el apodo o
 * ELIMINAR el perfil (supresión completa — Ley 1581, R8.3). Orquesta la capa de
 * storage; sin React.
 *
 * Reutiliza la validación de apodo de `features/auth` (normalización, longitud,
 * lenguaje ofensivo, unicidad por clase) para no duplicar reglas.
 */

import {
  containsOffensiveLanguage,
  isValidNicknameLength,
  nicknamesMatch,
  normalizeNickname,
} from '../auth';
import {
  deleteStudentData,
  getProfile,
  getProfilesByClassCode,
  putProfile,
} from '../../lib/storage';

export interface RenombrarResultado {
  ok: boolean;
  /** Mensaje de error en español (tono Bacatá), presente solo si `ok` es false. */
  error?: string;
}

export const MENSAJE_APODO_LONGITUD =
  'El apodo debe tener entre 2 y 20 caracteres.';
export const MENSAJE_APODO_OFENSIVO = 'Ese apodo no es apropiado. Prueba con otro.';
export const MENSAJE_APODO_DUPLICADO =
  'Ya hay otro estudiante con ese apodo en la clase.';
export const MENSAJE_ESTUDIANTE_NO_ENCONTRADO = 'No encontramos ese estudiante.';

/**
 * Renombra el apodo de un estudiante. Valida longitud y lenguaje, y comprueba
 * unicidad dentro de la clase (ignorando al propio estudiante). Persiste el
 * perfil con el apodo normalizado.
 */
export async function renombrarApodo(
  estudianteId: string,
  nuevoApodo: string,
): Promise<RenombrarResultado> {
  const perfil = await getProfile(estudianteId);
  if (!perfil) {
    return { ok: false, error: MENSAJE_ESTUDIANTE_NO_ENCONTRADO };
  }

  if (!isValidNicknameLength(nuevoApodo)) {
    return { ok: false, error: MENSAJE_APODO_LONGITUD };
  }
  if (containsOffensiveLanguage(nuevoApodo)) {
    return { ok: false, error: MENSAJE_APODO_OFENSIVO };
  }

  const normalizado = normalizeNickname(nuevoApodo);
  const companeros = await getProfilesByClassCode(perfil.codigoClase);
  const duplicado = companeros.some(
    (otro) => otro.id !== estudianteId && nicknamesMatch(otro.apodo, normalizado),
  );
  if (duplicado) {
    return { ok: false, error: MENSAJE_APODO_DUPLICADO };
  }

  await putProfile({ ...perfil, apodo: normalizado });
  return { ok: true };
}

/**
 * Elimina por completo los datos de un estudiante (derecho de supresión —
 * Ley 1581, R8.3): perfil, progreso, gamificación, repaso y cola de sync, en
 * una transacción. Operación irreversible; la UI pide confirmación accesible.
 */
export async function eliminarEstudiante(estudianteId: string): Promise<void> {
  await deleteStudentData(estudianteId);
}
