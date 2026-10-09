/**
 * Lógica pura de construcción de perfil de estudiante (sin React, sin IndexedDB).
 *
 * Arma el `PerfilEstudiante` que persistirá la capa `src/lib/storage`. El perfil
 * contiene EXACTAMENTE lo definido en el contrato (`design.md` → modelo de datos
 * local): `{ id, apodo, codigoClase, grado, creadoEn }`. Sin PII (R1.2, R8.1).
 */

import { newEventId } from '../../lib/storage';
import type { Grado } from '../../content/types';
import type { PerfilEstudiante } from '../../lib/storage';
import { normalizeClassCode } from './classCode';
import { normalizeNickname } from './nickname';

/** Entrada ya validada del formulario de acceso. */
export interface NuevoPerfilInput {
  apodo: string;
  codigoClase: string;
  grado: Grado;
}

/**
 * Construye un `PerfilEstudiante` nuevo con id interno idempotente y
 * `creadoEn` en ISO 8601. Normaliza apodo y código para que la comparación y la
 * recuperación sean consistentes (R1.6, R1.4).
 */
export function buildNewProfile(input: NuevoPerfilInput): PerfilEstudiante {
  return {
    id: newEventId(),
    apodo: normalizeNickname(input.apodo),
    codigoClase: normalizeClassCode(input.codigoClase),
    grado: input.grado,
    creadoEn: new Date().toISOString(),
  };
}
