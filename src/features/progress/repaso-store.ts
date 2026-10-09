import {
  deleteReview,
  getReview,
  getReviewByStudent,
  putReview,
} from '../../lib/storage';
import { alAcertarEnRepaso, alFallar, seleccionarDue } from './repaso';

/**
 * Wrapper de persistencia del repaso de errores (R14.1/R14.2/R14.3). Usa SOLO la
 * API pública de `src/lib/storage` (nunca IndexedDB directo) y combina el estado
 * guardado con la lógica PURA de `repaso.ts`. No conoce React.
 *
 * Privacidad (Ley 1581): todo se asocia a `estudianteId` interno + `ejercicioId`;
 * nunca PII, nunca se lee ni registra `docentePinHash`.
 *
 * Determinismo: `ahora` (epoch ms) se puede inyectar para pruebas; si falta, se
 * usa `Date.now()`.
 */

/**
 * R14.1: registra/actualiza el fallo de un ejercicio. Lee el record previo,
 * aplica `alFallar` (incrementa `fallos`, fija `proximaAparicion`) y persiste.
 */
export async function registrarFallo(
  estudianteId: string,
  ejercicioId: string,
  ahora: number = Date.now(),
): Promise<void> {
  const previo = await getReview(estudianteId, ejercicioId);
  const actualizado = alFallar(previo, estudianteId, ejercicioId, ahora);
  await putReview(actualizado);
}

/**
 * R14.2: ids de ejercicios "due" para armar la lección de repaso, ordenados por
 * `proximaAparicion` ascendente.
 */
export async function obtenerEjerciciosDue(
  estudianteId: string,
  ahora: number = Date.now(),
): Promise<string[]> {
  const repasos = await getReviewByStudent(estudianteId);
  return seleccionarDue(repasos, ahora).map((repaso) => repaso.ejercicioId);
}

/** Conteo de ejercicios due (para decidir si mostrar la entrada de repaso). */
export async function contarDue(
  estudianteId: string,
  ahora: number = Date.now(),
): Promise<number> {
  const repasos = await getReviewByStudent(estudianteId);
  return seleccionarDue(repasos, ahora).length;
}

/**
 * R14.3: tras ACERTAR un ejercicio en repaso, espacia (duplica el intervalo) o
 * elimina el record si quedó dominado. Si no existía, es un no-op.
 */
export async function registrarAciertoRepaso(
  estudianteId: string,
  ejercicioId: string,
  ahora: number = Date.now(),
): Promise<void> {
  const previo = await getReview(estudianteId, ejercicioId);
  if (!previo) {
    return;
  }
  const resultado = alAcertarEnRepaso(previo, ahora);
  if (resultado.tipo === 'eliminar') {
    await deleteReview(estudianteId, ejercicioId);
  } else {
    await putReview(resultado.repaso);
  }
}

/**
 * R14.3: al fallar DE NUEVO un ejercicio durante el repaso, se mantiene/acerca
 * la próxima aparición (reutiliza `registrarFallo`, que reinicia al día base).
 */
export async function registrarFalloRepaso(
  estudianteId: string,
  ejercicioId: string,
  ahora: number = Date.now(),
): Promise<void> {
  await registrarFallo(estudianteId, ejercicioId, ahora);
}
