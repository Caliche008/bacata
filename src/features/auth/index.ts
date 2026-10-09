/**
 * API pública de la feature de acceso del estudiante (features/auth).
 * El resto de la app (gate en src/app, features futuras) importa desde aquí.
 */

export { AccesoEstudiante } from './AccesoEstudiante';
export { SessionProvider } from './SessionProvider';
export { useSession } from './useSession';
export type { SessionContextValue } from './session-context';
