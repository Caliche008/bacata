/**
 * Hook `useSession`: acceso a la sesión del estudiante para las features
 * futuras (ruta, lecciones, progreso). Lanza si se usa fuera del provider.
 */

import { useContext } from 'react';
import { SessionContext, type SessionContextValue } from './session-context';

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (ctx === null) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  }
  return ctx;
}
