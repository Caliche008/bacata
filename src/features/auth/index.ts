/**
 * API pública de la feature de acceso del estudiante (features/auth).
 * El resto de la app (gate en src/app, features futuras) importa desde aquí.
 */

export { AccesoEstudiante } from './AccesoEstudiante';
export type { AccesoEstudianteProps } from './AccesoEstudiante';
export { SessionProvider } from './SessionProvider';
export { useSession } from './useSession';
export type { SessionContextValue } from './session-context';

// Utilidades puras reutilizadas por el panel docente (features/teacher).
export {
  CLASS_CODE_ALPHABET,
  CLASS_CODE_MIN_LENGTH,
  CLASS_CODE_MAX_LENGTH,
  CLASS_CODE_DEFAULT_LENGTH,
  normalizeClassCode,
  isValidClassCode,
  generateClassCode,
} from './classCode';
export {
  normalizeNickname,
  isValidNicknameLength,
  nicknamesMatch,
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
} from './nickname';
export { containsOffensiveLanguage } from './offensive-words';
