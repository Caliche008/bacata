/**
 * Contexto de sesión del estudiante.
 *
 * Se separa del Provider para que el hook `useSession` viva en su propio archivo
 * sin disparar la regla react-refresh de "solo componentes" (igual que
 * `theme-context.ts`).
 */

import { createContext } from 'react';
import type { PerfilEstudiante } from '../../lib/storage';

export interface SessionContextValue {
  /** Perfil activo, o null si no hay sesión. */
  perfil: PerfilEstudiante | null;
  /** True mientras se resuelve la sesión inicial desde almacenamiento. */
  cargando: boolean;
  /** Inicia sesión con un perfil ya creado/recuperado y lo persiste (R1.4). */
  iniciarSesion: (perfil: PerfilEstudiante) => void;
  /** Cierra la sesión; el perfil permanece para reentrar sin re-pedir código. */
  cerrarSesion: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
