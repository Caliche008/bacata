import { useCallback, useEffect, useState } from 'react';
import { getCursoPorGrado, initContent, type Curso } from '../../content';
import { getClassGrade, getTeacherPinHash } from '../../lib/preferences';
import type { ClaseLocal } from '../../lib/storage';
import type { Grado } from '../../content/types';
import { crearClase, listarClases, regenerarCodigo } from './classes-service';
import { resumenClase, type ResumenEstudiante } from './progress-service';

/**
 * Hook de datos del panel docente (enlaza los servicios con React, sin JSX).
 * Patrón de `useRuta.ts`: estado + `cargando`/`error` + `recargar`.
 *
 * El panel decide el curso a gestionar por el GRADO que el docente elige para
 * la clase (persistido en preferencias), porque `ClaseLocal` no lleva grado.
 */

export interface UseTeacherPanelResult {
  cargando: boolean;
  error: string | null;
  clases: ClaseLocal[];
  claseSeleccionada: ClaseLocal | null;
  gradoSeleccionado: Grado;
  curso: Curso | null;
  resumen: ResumenEstudiante[];
  seleccionarClase: (claseId: string) => void;
  cambiarGrado: (grado: Grado) => void;
  nuevaClase: (grado: Grado, idsUnidadesActivas: string[]) => Promise<void>;
  regenerar: (claseId: string) => Promise<void>;
  recargar: () => void;
}

export function useTeacherPanel(): UseTeacherPanelResult {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clases, setClases] = useState<ClaseLocal[]>([]);
  const [claseId, setClaseId] = useState<string | null>(null);
  const [gradoSeleccionado, setGradoSeleccionado] = useState<Grado>(6);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [resumen, setResumen] = useState<ResumenEstudiante[]>([]);
  const [recarga, setRecarga] = useState(0);

  const recargar = useCallback(() => setRecarga((v) => v + 1), []);

  const claseSeleccionada = clases.find((c) => c.id === claseId) ?? null;
  const codigoSeleccionado = claseSeleccionada?.codigo ?? null;
  const idSeleccionado = claseSeleccionada?.id ?? null;

  // Carga la lista de clases y mantiene una selección válida.
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    void (async () => {
      try {
        const lista = await listarClases();
        if (!activo) {
          return;
        }
        setClases(lista);
        setClaseId((actual) => {
          if (actual && lista.some((c) => c.id === actual)) {
            return actual;
          }
          return lista[0]?.id ?? null;
        });
      } catch {
        if (activo) {
          setError('No pudimos cargar las clases.');
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
  }, [recarga]);

  // Al cambiar de clase, recupera el grado recordado para esa clase.
  useEffect(() => {
    if (!idSeleccionado) {
      return;
    }
    const grado = getClassGrade(idSeleccionado);
    if (grado) {
      setGradoSeleccionado(grado);
    }
  }, [idSeleccionado]);

  // Carga el curso del grado seleccionado y el resumen de progreso de la clase.
  useEffect(() => {
    let activo = true;

    void (async () => {
      try {
        const index = await initContent();
        const cursoGrado = getCursoPorGrado(index, gradoSeleccionado);
        if (!activo) {
          return;
        }
        setCurso(cursoGrado ?? null);

        if (cursoGrado && codigoSeleccionado) {
          const datos = await resumenClase(codigoSeleccionado, cursoGrado);
          if (activo) {
            setResumen(datos);
          }
        } else if (activo) {
          setResumen([]);
        }
      } catch {
        if (activo) {
          setError('No pudimos cargar el progreso de la clase.');
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [gradoSeleccionado, codigoSeleccionado, recarga]);

  const seleccionarClase = useCallback((id: string) => setClaseId(id), []);
  const cambiarGrado = useCallback((grado: Grado) => setGradoSeleccionado(grado), []);

  const nuevaClase = useCallback(
    async (grado: Grado, idsUnidadesActivas: string[]) => {
      const pinHash = getTeacherPinHash() ?? '';
      const clase = await crearClase({ grado, idsUnidadesActivas, pinHash });
      setClaseId(clase.id);
      recargar();
    },
    [recargar],
  );

  const regenerar = useCallback(
    async (id: string) => {
      await regenerarCodigo(id);
      recargar();
    },
    [recargar],
  );

  return {
    cargando,
    error,
    clases,
    claseSeleccionada,
    gradoSeleccionado,
    curso,
    resumen,
    seleccionarClase,
    cambiarGrado,
    nuevaClase,
    regenerar,
    recargar,
  };
}
