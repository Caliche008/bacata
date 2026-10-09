import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Grado } from '../../content/types';
import {
  getProfilesByClassCode,
  putProfile,
  type PerfilEstudiante,
} from '../../lib/storage';
import {
  clearAttemptsState,
  getAttemptsState,
  setAttemptsState,
} from '../../lib/preferences/session';
import { isValidClassCode, normalizeClassCode } from './classCode';
import {
  isValidNicknameLength,
  nicknamesMatch,
  normalizeNickname,
} from './nickname';
import { containsOffensiveLanguage } from './offensive-words';
import {
  clearExpiredLock,
  INITIAL_ATTEMPTS,
  isLocked,
  registerFailedAttempt,
  remainingMs,
  type AttemptsState,
} from './attempts';
import { buildNewProfile } from './session';
import { useSession } from './useSession';

/** Campo al que apunta un error (para mover el foco de forma accesible). */
export type AuthErrorField = 'codigoClase' | 'apodo' | 'general';

export interface AuthError {
  field: AuthErrorField;
  message: string;
}

export interface AuthFormValues {
  codigoClase: string;
  apodo: string;
  grado: Grado;
}

/** Mensajes de usuario en español con tono Bacatá (tuteo, frases cortas). */
const MENSAJES = {
  codigoInvalido:
    'Revisa el código de tu clase. Son de 6 a 8 letras y números, sin espacios.',
  apodoCorto: 'Elige un apodo de 2 a 20 caracteres.',
  apodoOfensivo: 'Ese apodo no es apropiado. Elige otro, por favor.',
  apodoEnUso: 'Ese apodo ya está en uso en esta clase. Elige uno distinto.',
  conflictoGrado:
    'Ese apodo ya existe en esta clase con otro grado. Elige otro apodo.',
  bloqueado: (segundos: number) =>
    `Demasiados intentos. Espera ${segundos} s y vuelve a intentarlo.`,
  errorGuardado:
    'No pudimos guardar tu perfil en este dispositivo. Inténtalo de nuevo.',
} as const;

function initialAttempts(now: number): AttemptsState {
  const stored = getAttemptsState();
  return clearExpiredLock(stored ?? INITIAL_ATTEMPTS, now);
}

/**
 * Orquesta el formulario de acceso del estudiante: valida (código, apodo,
 * ofensivas), aplica unicidad por clase contra los perfiles locales, crea o
 * recupera el `perfilEstudiante` en IndexedDB e inicia la sesión. Mantiene el
 * límite de intentos con bloqueo temporal (R1.8). Sin JSX: la UI la consume.
 */
export function useAuthForm() {
  const { iniciarSesion } = useSession();

  const [attempts, setAttempts] = useState<AttemptsState>(() =>
    initialAttempts(Date.now()),
  );
  const [error, setError] = useState<AuthError | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [restante, setRestante] = useState<number>(() =>
    remainingMs(initialAttempts(Date.now()), Date.now()),
  );

  const bloqueado = restante > 0;

  // Cuenta regresiva del bloqueo (se anuncia por aria-live desde la UI).
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!bloqueado) {
      return;
    }
    intervalRef.current = setInterval(() => {
      setRestante((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bloqueado]);

  const persistAttempts = useCallback((next: AttemptsState) => {
    setAttempts(next);
    setAttemptsState(next);
    setRestante(remainingMs(next, Date.now()));
  }, []);

  /**
   * Procesa un intento de ingreso. Devuelve el perfil creado/recuperado o null
   * si hubo error (el error queda en `error`). No registra el código en logs.
   */
  const enviar = useCallback(
    async (values: AuthFormValues): Promise<PerfilEstudiante | null> => {
      const now = Date.now();
      const current = clearExpiredLock(attempts, now);

      if (isLocked(current, now)) {
        const segundos = Math.ceil(remainingMs(current, now) / 1000);
        setError({ field: 'general', message: MENSAJES.bloqueado(segundos) });
        return null;
      }

      // 1. Formato del código (R1.3). Un fallo de formato cuenta para el bloqueo.
      if (!isValidClassCode(values.codigoClase)) {
        const next = registerFailedAttempt(current, now);
        persistAttempts(next);
        if (isLocked(next, now)) {
          const segundos = Math.ceil(remainingMs(next, now) / 1000);
          setError({ field: 'general', message: MENSAJES.bloqueado(segundos) });
        } else {
          setError({ field: 'codigoClase', message: MENSAJES.codigoInvalido });
        }
        return null;
      }

      // 2. Longitud del apodo.
      if (!isValidNicknameLength(values.apodo)) {
        setError({ field: 'apodo', message: MENSAJES.apodoCorto });
        return null;
      }

      // 3. Apodo ofensivo (R1.7).
      if (containsOffensiveLanguage(values.apodo)) {
        setError({ field: 'apodo', message: MENSAJES.apodoOfensivo });
        return null;
      }

      const codigo = normalizeClassCode(values.codigoClase);
      const apodo = normalizeNickname(values.apodo);

      setEnviando(true);
      try {
        // 4. Unicidad por clase (R1.6) + crear o recuperar (R1.1).
        const existentes = await getProfilesByClassCode(codigo);
        const coincidente = existentes.find((p) =>
          nicknamesMatch(p.apodo, apodo),
        );

        if (coincidente) {
          if (coincidente.grado !== values.grado) {
            // Mismo apodo+código con otro grado: se trata como conflicto.
            setError({ field: 'apodo', message: MENSAJES.conflictoGrado });
            return null;
          }
          // Mismo apodo + mismo código + mismo grado: es el mismo estudiante.
          clearAttemptsState();
          persistAttempts(INITIAL_ATTEMPTS);
          setError(null);
          iniciarSesion(coincidente);
          return coincidente;
        }

        // 5. Crear perfil nuevo.
        const nuevo = buildNewProfile({
          apodo,
          codigoClase: codigo,
          grado: values.grado,
        });
        await putProfile(nuevo);

        clearAttemptsState();
        persistAttempts(INITIAL_ATTEMPTS);
        setError(null);
        iniciarSesion(nuevo);
        return nuevo;
      } catch {
        setError({ field: 'general', message: MENSAJES.errorGuardado });
        return null;
      } finally {
        setEnviando(false);
      }
    },
    [attempts, iniciarSesion, persistAttempts],
  );

  const segundosRestantes = useMemo(
    () => Math.ceil(restante / 1000),
    [restante],
  );

  return {
    error,
    enviando,
    bloqueado,
    segundosRestantes,
    enviar,
    limpiarError: useCallback(() => setError(null), []),
  };
}
