import { useCallback, useEffect, useRef, useState } from 'react';
import type { Curso } from '../../content';
import type { ResumenLeccion } from '../lessons/answers';
import {
  obtenerAvanceEjePaz,
  obtenerGamificacion,
  registrarLeccionCompletada,
} from './gamificacion-store';
import type { AvanceEjePaz } from './gamification';

/**
 * Hook de datos de la gamificación (tarea 10.3). Encapsula la asincronía del
 * wrapper de persistencia (`gamificacion-store`) para que `RutaAprendizaje` solo
 * consuma estado ya resuelto y una acción `registrar`. No conoce IndexedDB: usa
 * SOLO la API pública de la feature. Sin PII: todo se asocia a `estudianteId`.
 *
 * - Carga inicial: XP, racha, logros (desde `obtenerGamificacion`) y el avance en
 *   el eje de la Cátedra de la Paz (R12.5). Se recarga si cambia el estudiante o
 *   el curso.
 * - `registrar(resumen, unidadesCompletadas)`: suma la XP de la lección, aplica
 *   la racha y evalúa logros (vía `registrarLeccionCompletada`), y refresca el
 *   estado local (xp, rachaActual, logros, avance en eje Paz) junto con lo que la
 *   UI debe celebrar (`logrosNuevos`, `xpUltimaLeccion`, `reinicioReciente`).
 *   DEBE invocarse una sola vez por lección completada: NO es idempotente en XP.
 */

export interface EstadoGamificacion {
  cargando: boolean;
  xp: number;
  rachaActual: number;
  logros: string[];
  avanceEjePaz: AvanceEjePaz;
  /** XP ganada en la última lección registrada (para la celebración). */
  xpUltimaLeccion: number;
  /** Logros recién otorgados en la última lección (para la celebración). */
  logrosNuevos: string[];
  /** `true` si la racha se reinició en la última lección (mensaje motivador). */
  reinicioReciente: boolean;
}

export interface UseGamificacionResult extends EstadoGamificacion {
  /** Registra una lección completada y actualiza el estado local. */
  registrar: (resumen: ResumenLeccion, unidadesCompletadas: readonly string[]) => Promise<void>;
}

const AVANCE_VACIO: AvanceEjePaz = { porcentaje: 0, completadas: 0, total: 0 };

export function useGamificacion(
  estudianteId: string | undefined,
  curso: Curso | null,
): UseGamificacionResult {
  const [estado, setEstado] = useState<EstadoGamificacion>({
    cargando: true,
    xp: 0,
    rachaActual: 0,
    logros: [],
    avanceEjePaz: AVANCE_VACIO,
    xpUltimaLeccion: 0,
    logrosNuevos: [],
    reinicioReciente: false,
  });

  // Mantiene el curso vigente accesible desde `registrar` sin recrear la acción.
  const cursoRef = useRef<Curso | null>(curso);
  cursoRef.current = curso;

  useEffect(() => {
    if (!estudianteId || !curso) {
      return;
    }

    let activo = true;
    setEstado((prev) => ({ ...prev, cargando: true }));

    void (async () => {
      try {
        const [gamificacion, avanceEjePaz] = await Promise.all([
          obtenerGamificacion(estudianteId),
          obtenerAvanceEjePaz(estudianteId, curso),
        ]);
        if (!activo) {
          return;
        }
        setEstado({
          cargando: false,
          xp: gamificacion.xp,
          rachaActual: gamificacion.rachaActual,
          logros: gamificacion.logros,
          avanceEjePaz,
          xpUltimaLeccion: 0,
          logrosNuevos: [],
          reinicioReciente: false,
        });
      } catch {
        if (activo) {
          setEstado((prev) => ({ ...prev, cargando: false }));
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [estudianteId, curso]);

  const registrar = useCallback(
    async (resumen: ResumenLeccion, unidadesCompletadas: readonly string[]) => {
      const cursoActual = cursoRef.current;
      if (!estudianteId || !cursoActual) {
        return;
      }
      const resultado = await registrarLeccionCompletada({
        estudianteId,
        resumen,
        curso: cursoActual,
        unidadesCompletadas,
      });
      const avanceEjePaz = await obtenerAvanceEjePaz(estudianteId, cursoActual);
      setEstado((prev) => ({
        ...prev,
        cargando: false,
        xp: resultado.gamificacion.xp,
        rachaActual: resultado.gamificacion.rachaActual,
        logros: resultado.gamificacion.logros,
        avanceEjePaz,
        xpUltimaLeccion: resultado.xpGanada,
        logrosNuevos: resultado.logrosNuevos,
        reinicioReciente: resultado.reinicioRacha,
      }));
    },
    [estudianteId],
  );

  return { ...estado, registrar };
}
