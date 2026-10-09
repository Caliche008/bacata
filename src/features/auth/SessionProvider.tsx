import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getProfile, type PerfilEstudiante } from '../../lib/storage';
import {
  clearActiveSessionId,
  getActiveSessionId,
  setActiveSessionId,
} from '../../lib/preferences/session';
import { SessionContext } from './session-context';

/**
 * Provee la sesión del estudiante al árbol de la app.
 *
 * Arranque (R1.4): lee de forma síncrona el id de sesión persistido en
 * `localStorage` y, si existe, recupera el `PerfilEstudiante` desde IndexedDB
 * (`getProfile`) SIN volver a pedir el código. Mientras resuelve, expone
 * `cargando=true` para que el gate no parpadee. Si el perfil ya no existe
 * (p. ej. el docente lo eliminó), se limpia la sesión.
 *
 * Privacidad: no se guarda PII en el contexto; el perfil solo tiene apodo,
 * código, grado e id interno (contrato de `src/lib/storage`).
 */

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    const id = getActiveSessionId();

    if (id === null) {
      setCargando(false);
      return;
    }

    getProfile(id)
      .then((recuperado) => {
        if (!activo) {
          return;
        }
        if (recuperado) {
          setPerfil(recuperado);
        } else {
          // El perfil ya no está: limpiar la sesión huérfana.
          clearActiveSessionId();
        }
      })
      .catch(() => {
        // Si falla la lectura, no bloqueamos el acceso: se trata como "sin sesión".
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const iniciarSesion = useCallback((nuevo: PerfilEstudiante) => {
    setActiveSessionId(nuevo.id);
    setPerfil(nuevo);
  }, []);

  const cerrarSesion = useCallback(() => {
    clearActiveSessionId();
    setPerfil(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{ perfil, cargando, iniciarSesion, cerrarSesion }}
    >
      {children}
    </SessionContext.Provider>
  );
}
