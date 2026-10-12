import { useCallback, useEffect, useState } from 'react';
import {
  getCursoPorGrado,
  initContent,
  type Curso,
} from '../../content';
import { getClassByCode, getProgressByStudent } from '../../lib/storage';
import { useSession } from '../auth';
import { construirRuta, type RutaVista } from './path';

/**
 * Hook de datos de la ruta de aprendizaje (tarea 8). Enlaza las capas puras:
 *
 * - Sesión (`useSession`) → grado y `codigoClase` del estudiante.
 * - Contenido (`initContent` + `getCursoPorGrado`) → curso del grado.
 * - Storage (`getProgressByStudent`, `getClassByCode`) → progreso y unidades
 *   activas del docente. NO toca IndexedDB directo; solo la API de
 *   `src/lib/storage`. NUNCA lee `docentePinHash` (secreto, R8.6): de la clase
 *   solo se usa `unidadesActivas`.
 *
 * Fallback de unidades activas (R6.4): si no hay registro de clase, o la clase
 * no define `unidadesActivas` (vacío), se pasa `null` a la lógica pura → se
 * muestran TODAS las unidades.
 */

export interface UseRutaResult {
  cargando: boolean;
  /** Mensaje de error en español, o `null`. Solo para fallos reales de carga. */
  error: string | null;
  /**
   * `true` cuando el grado del estudiante aún no tiene contenido empaquetado.
   * NO es un error: la plataforma soporta 6–11 y el contenido llega por fases.
   * Se separa del canal `error` para mostrar un estado vacío amable (no `alert`).
   */
  sinContenido: boolean;
  curso: Curso | null;
  ruta: RutaVista | null;
  /** Vuelve a derivar la ruta desde el progreso (p. ej. tras completar). */
  recargar: () => void;
}

export function useRuta(): UseRutaResult {
  const { perfil } = useSession();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sinContenido, setSinContenido] = useState(false);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [ruta, setRuta] = useState<RutaVista | null>(null);
  const [recarga, setRecarga] = useState(0);

  const recargar = useCallback(() => {
    setRecarga((valor) => valor + 1);
  }, []);

  useEffect(() => {
    if (!perfil) {
      return;
    }

    let activo = true;
    setCargando(true);
    setError(null);
    setSinContenido(false);

    void (async () => {
      try {
        const index = await initContent();
        const cursoGrado = getCursoPorGrado(index, perfil.grado);
        if (!cursoGrado) {
          // No es un error: el grado está habilitado pero su contenido llega
          // por fases. Se marca `sinContenido` para el estado vacío amable.
          if (activo) {
            setCurso(null);
            setRuta(null);
            setError(null);
            setSinContenido(true);
          }
          return;
        }

        const [progreso, clase] = await Promise.all([
          getProgressByStudent(perfil.id),
          getClassByCode(perfil.codigoClase),
        ]);

        // R6.4: lista no vacía filtra; ausencia o lista vacía => null (todas).
        const activas =
          clase && clase.unidadesActivas.length > 0 ? clase.unidadesActivas : null;

        if (activo) {
          setCurso(cursoGrado);
          setRuta(construirRuta(cursoGrado, activas, progreso));
        }
      } catch {
        if (activo) {
          setError('No pudimos cargar tu ruta. Intenta de nuevo.');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [perfil, recarga]);

  return { cargando, error, sinContenido, curso, ruta, recargar };
}
