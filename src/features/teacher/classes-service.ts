/**
 * Lógica de gestión de clases del docente (orquesta `src/lib/storage`, sin
 * React). Toda la persistencia pasa por la capa de storage; nunca IndexedDB
 * directo.
 *
 * `docentePinHash` es un secreto (R8.6): se guarda en el record de la clase para
 * respetar el contrato de `ClaseLocal`, pero esta capa nunca lo registra ni lo
 * expone.
 */

import { generateClassCode } from '../auth';
import { setClassGrade } from '../../lib/preferences';
import {
  getAllClasses,
  getClass,
  getClassByCode,
  newEventId,
  putClass,
  type ClaseLocal,
} from '../../lib/storage';
import type { Grado } from '../../content/types';

/** Reintentos máximos para encontrar un código no usado (colisión es rarísima). */
const MAX_INTENTOS_CODIGO = 10;

/** Genera un código de clase que no exista aún en `clasesLocales` (R6.1). */
async function generarCodigoUnico(): Promise<string> {
  for (let intento = 0; intento < MAX_INTENTOS_CODIGO; intento += 1) {
    const codigo = generateClassCode();
    const existente = await getClassByCode(codigo);
    if (!existente) {
      return codigo;
    }
  }
  throw new Error('No pudimos generar un código único. Inténtalo de nuevo.');
}

export interface CrearClaseInput {
  grado: Grado;
  /** Ids de unidad a MOSTRAR al estudiante (formato que consume la ruta). */
  idsUnidadesActivas: string[];
  /** Hash del PIN del docente (secreto, nunca se loguea). */
  pinHash: string;
}

/**
 * Crea una clase con código único y la persiste. Recuerda el grado elegido por
 * el docente (vía preferencias, ya que `ClaseLocal` no lleva grado). Devuelve el
 * record creado.
 */
export async function crearClase(input: CrearClaseInput): Promise<ClaseLocal> {
  const codigo = await generarCodigoUnico();
  const clase: ClaseLocal = {
    id: newEventId(),
    codigo,
    unidadesActivas: [...input.idsUnidadesActivas],
    docentePinHash: input.pinHash,
  };
  await putClass(clase);
  setClassGrade(clase.id, input.grado);
  return clase;
}

/** Lista todas las clases locales. */
export async function listarClases(): Promise<ClaseLocal[]> {
  return getAllClasses();
}

/**
 * Regenera el código de una clase (R6.7). El código anterior deja de servir:
 * los estudiantes ya registrados CONSERVAN su progreso local (su perfil guarda
 * el `codigoClase` con el que entraron), pero no podrán volver a entrar con el
 * código viejo. "Desactivar" un código se implementa como regenerarlo.
 */
export async function regenerarCodigo(claseId: string): Promise<ClaseLocal> {
  const clase = await getClass(claseId);
  if (!clase) {
    throw new Error('No encontramos esa clase.');
  }
  const codigo = await generarCodigoUnico();
  const actualizada: ClaseLocal = { ...clase, codigo };
  await putClass(actualizada);
  return actualizada;
}

/**
 * Escribe `unidadesActivas` en el FORMATO que consume la ruta del estudiante
 * (`useRuta`/`path.ts`): una lista explícita de ids de UNIDAD a mostrar. Una
 * unidad "desactivada" es simplemente la que falta de la lista. Guardar la lista
 * completa de ids activos permite que la ocultación (R6.4) funcione de verdad.
 */
export async function setUnidadesActivas(
  claseId: string,
  idsActivos: string[],
): Promise<void> {
  const clase = await getClass(claseId);
  if (!clase) {
    throw new Error('No encontramos esa clase.');
  }
  const actualizada: ClaseLocal = { ...clase, unidadesActivas: [...idsActivos] };
  await putClass(actualizada);
}
