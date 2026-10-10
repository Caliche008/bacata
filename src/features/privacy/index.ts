/**
 * API pública de la feature de privacidad (features/privacy): la vista de la
 * política de privacidad y el borrado de datos del propio estudiante (R8.3,
 * R8.4, R8.5, R8.8). El gate en `src/app` y las features de UI importan desde
 * aquí.
 */

export { PoliticaPrivacidad } from './PoliticaPrivacidad';
export type { PoliticaPrivacidadProps } from './PoliticaPrivacidad';
export { BorrarMisDatos } from './BorrarMisDatos';
export {
  POLITICA_PRIVACIDAD,
  AVISO_BORRADOR,
} from './privacy-policy';
export type {
  PoliticaPrivacidad as PoliticaPrivacidadData,
  SeccionPolitica,
  BloquePolitica,
} from './privacy-policy';
