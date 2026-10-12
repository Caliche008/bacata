import { useCallback, useEffect, useRef, useState } from 'react';
import type { Curso, Ejercicio, Grado, Leccion, Unidad } from '../../../content/types';
import {
  getDraftsByGrade,
  putDraft,
  type BorradorContenido,
} from '../../../lib/storage';
import { asegurarId, idEjercicio, idLeccion, idUnidad, slugify } from './ids';
import { erroresCurso, type ErroresCampo } from './validation';

/**
 * Hook de estado del editor de contenido del docente (sin JSX; patrón de
 * `useTeacherPanel.ts`: estado + `cargando`/`error`).
 *
 * Carga el borrador del grado indicado (o crea uno nuevo si no existe), expone
 * el curso editable y las acciones CRUD de unidades y lecciones. Genera ids
 * estables con `ids.ts` al crear y los conserva al editar. Cada cambio
 * programa un autosave (debounce) al store `borradoresContenido` (FEAT-001).
 *
 * El área se fija en `'ciencias_sociales'` (único área del MVP). El contenido
 * no es PII y nunca se registra en logs.
 */

/** Campos de la unidad que el formulario puede editar directamente. */
export type CamposUnidad = Pick<
  Unidad,
  'titulo' | 'descripcion' | 'orden' | 'objetivos' | 'ejePaz' | 'catedraPaz'
>;

/** Campos de la lección que el formulario puede editar directamente. */
export type CamposLeccion = Pick<
  Leccion,
  'titulo' | 'objetivoAprendizaje' | 'competencia' | 'orden'
>;

/** Campos del curso (cabecera) que el formulario puede editar directamente. */
export type CamposCurso = Pick<Curso, 'titulo' | 'descripcion' | 'version'>;

export interface UseEditorContenidoResult {
  cargando: boolean;
  error: string | null;
  /** Borrador en edición (null mientras carga). */
  curso: Curso | null;
  /** Errores de validación en vivo del curso completo (ruta -> mensaje). */
  errores: ErroresCampo;
  /** Edita los campos de cabecera del curso. */
  editarCurso: (campos: Partial<CamposCurso>) => void;
  /** Reemplaza el curso completo en edición (p. ej. al importar un JSON válido). */
  reemplazarCurso: (curso: Curso) => void;
  /** Añade una unidad vacía al final y devuelve su id generado. */
  anadirUnidad: () => string;
  /** Edita los campos de una unidad por id (conserva su id). */
  editarUnidad: (unidadId: string, campos: Partial<CamposUnidad>) => void;
  /** Reordena una unidad una posición hacia arriba o abajo. */
  moverUnidad: (unidadId: string, direccion: 'subir' | 'bajar') => void;
  /** Elimina una unidad por id. */
  eliminarUnidad: (unidadId: string) => void;
  /** Añade una lección vacía al final de una unidad y devuelve su id. */
  anadirLeccion: (unidadId: string) => string;
  /** Edita los campos de una lección (conserva su id). */
  editarLeccion: (
    unidadId: string,
    leccionId: string,
    campos: Partial<CamposLeccion>,
  ) => void;
  /** Reordena una lección dentro de su unidad. */
  moverLeccion: (
    unidadId: string,
    leccionId: string,
    direccion: 'subir' | 'bajar',
  ) => void;
  /** Elimina una lección de una unidad. */
  eliminarLeccion: (unidadId: string, leccionId: string) => void;
  /** Añade un ejercicio (opción múltiple vacío) al final de una lección; devuelve su id. */
  anadirEjercicio: (unidadId: string, leccionId: string) => string;
  /** Reemplaza un ejercicio completo por su id (conserva su id si quedó vacío). */
  editarEjercicio: (
    unidadId: string,
    leccionId: string,
    ejercicioId: string,
    ejercicio: Ejercicio,
  ) => void;
  /** Reordena un ejercicio dentro de su lección. */
  moverEjercicio: (
    unidadId: string,
    leccionId: string,
    ejercicioId: string,
    direccion: 'subir' | 'bajar',
  ) => void;
  /** Elimina un ejercicio de una lección. */
  eliminarEjercicio: (unidadId: string, leccionId: string, ejercicioId: string) => void;
}

const RETRASO_AUTOSAVE_MS = 400;

/** Id estable del borrador por grado: un borrador por grado en edición. */
function idBorrador(grado: Grado): string {
  return `borrador-grado-${grado}`;
}

/** Curso vacío inicial para un grado (área fija del MVP). */
function cursoInicial(grado: Grado): Curso {
  return {
    id: `curso-cs-${grado}`,
    grado,
    area: 'ciencias_sociales',
    titulo: '',
    descripcion: '',
    version: '0.1.0',
    unidades: [],
  };
}

/** Reordena `arr` moviendo el índice `desde` en `direccion`, sin mutar el original. */
function mover<T>(arr: T[], desde: number, direccion: 'subir' | 'bajar'): T[] {
  const hacia = direccion === 'subir' ? desde - 1 : desde + 1;
  if (desde < 0 || hacia < 0 || hacia >= arr.length) {
    return arr;
  }
  const copia = [...arr];
  const [elemento] = copia.splice(desde, 1);
  copia.splice(hacia, 0, elemento);
  // Reasigna `orden` para que refleje la posición visible (1-indexado).
  return copia.map((item, i) =>
    typeof (item as { orden?: unknown }).orden === 'number'
      ? { ...item, orden: i + 1 }
      : item,
  );
}

export function useEditorContenido(grado: Grado): UseEditorContenidoResult {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);

  // Id del borrador cargado y timer de autosave (persisten entre renders).
  const borradorIdRef = useRef<string>(idBorrador(grado));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga (o crea) el borrador del grado.
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    borradorIdRef.current = idBorrador(grado);

    void (async () => {
      try {
        const borradores = await getDraftsByGrade(grado);
        if (!activo) {
          return;
        }
        const existente = borradores.find((b) => b.id === borradorIdRef.current);
        setCurso(existente ? existente.curso : cursoInicial(grado));
      } catch {
        if (activo) {
          setError('No pudimos cargar el borrador de contenido.');
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
  }, [grado]);

  // Autosave con debounce: cada vez que cambia el curso, programa un putDraft.
  useEffect(() => {
    if (!curso || cargando) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      const borrador: BorradorContenido = {
        id: borradorIdRef.current,
        grado,
        curso,
        actualizadoEn: new Date().toISOString(),
      };
      void putDraft(borrador).catch(() => {
        setError('No pudimos guardar los cambios en este dispositivo.');
      });
    }, RETRASO_AUTOSAVE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [curso, grado, cargando]);

  const editarCurso = useCallback((campos: Partial<CamposCurso>) => {
    setCurso((actual) => (actual ? { ...actual, ...campos } : actual));
  }, []);

  const reemplazarCurso = useCallback((nuevo: Curso) => {
    setCurso(nuevo);
  }, []);

  const anadirUnidad = useCallback((): string => {
    const existentes = (curso?.unidades ?? []).map((u) => u.id);
    const nuevoId = idUnidad(grado, 'unidad', existentes);
    setCurso((actual) => {
      if (!actual) {
        return actual;
      }
      const unidad: Unidad = {
        id: nuevoId,
        titulo: '',
        descripcion: '',
        orden: actual.unidades.length + 1,
        objetivos: [],
        ejePaz: true,
        catedraPaz: { tematicas: [], como: '' },
        lecciones: [],
      };
      return { ...actual, unidades: [...actual.unidades, unidad] };
    });
    return nuevoId;
  }, [curso, grado]);

  const editarUnidad = useCallback(
    (unidadId: string, campos: Partial<CamposUnidad>) => {
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        return {
          ...actual,
          unidades: actual.unidades.map((u) =>
            u.id === unidadId ? { ...u, ...campos, id: asegurarId(u.id, () => u.id) } : u,
          ),
        };
      });
    },
    [],
  );

  const moverUnidad = useCallback(
    (unidadId: string, direccion: 'subir' | 'bajar') => {
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        const i = actual.unidades.findIndex((u) => u.id === unidadId);
        if (i === -1) {
          return actual;
        }
        return { ...actual, unidades: mover(actual.unidades, i, direccion) };
      });
    },
    [],
  );

  const eliminarUnidad = useCallback((unidadId: string) => {
    setCurso((actual) => {
      if (!actual) {
        return actual;
      }
      const unidades = actual.unidades
        .filter((u) => u.id !== unidadId)
        .map((u, i) => ({ ...u, orden: i + 1 }));
      return { ...actual, unidades };
    });
  }, []);

  const anadirLeccion = useCallback(
    (unidadId: string): string => {
      const unidad = curso?.unidades.find((u) => u.id === unidadId);
      const existentes = (unidad?.lecciones ?? []).map((l) => l.id);
      const unidadSlug = slugify(unidad?.titulo || unidadId);
      const nuevoId = idLeccion(grado, unidadSlug, 'leccion', existentes);
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        return {
          ...actual,
          unidades: actual.unidades.map((u) => {
            if (u.id !== unidadId) {
              return u;
            }
            const leccion: Leccion = {
              id: nuevoId,
              titulo: '',
              objetivoAprendizaje: '',
              competencia: '',
              orden: u.lecciones.length + 1,
              ejercicios: [],
            };
            return { ...u, lecciones: [...u.lecciones, leccion] };
          }),
        };
      });
      return nuevoId;
    },
    [curso, grado],
  );

  const editarLeccion = useCallback(
    (unidadId: string, leccionId: string, campos: Partial<CamposLeccion>) => {
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        return {
          ...actual,
          unidades: actual.unidades.map((u) =>
            u.id === unidadId
              ? {
                  ...u,
                  lecciones: u.lecciones.map((l) =>
                    l.id === leccionId ? { ...l, ...campos } : l,
                  ),
                }
              : u,
          ),
        };
      });
    },
    [],
  );

  const moverLeccion = useCallback(
    (unidadId: string, leccionId: string, direccion: 'subir' | 'bajar') => {
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        return {
          ...actual,
          unidades: actual.unidades.map((u) => {
            if (u.id !== unidadId) {
              return u;
            }
            const i = u.lecciones.findIndex((l) => l.id === leccionId);
            if (i === -1) {
              return u;
            }
            return { ...u, lecciones: mover(u.lecciones, i, direccion) };
          }),
        };
      });
    },
    [],
  );

  const eliminarLeccion = useCallback((unidadId: string, leccionId: string) => {
    setCurso((actual) => {
      if (!actual) {
        return actual;
      }
      return {
        ...actual,
        unidades: actual.unidades.map((u) =>
          u.id === unidadId
            ? {
                ...u,
                lecciones: u.lecciones
                  .filter((l) => l.id !== leccionId)
                  .map((l, i) => ({ ...l, orden: i + 1 })),
              }
            : u,
        ),
      };
    });
  }, []);

  const anadirEjercicio = useCallback(
    (unidadId: string, leccionId: string): string => {
      const leccion = curso?.unidades
        .find((u) => u.id === unidadId)
        ?.lecciones.find((l) => l.id === leccionId);
      const existentes = (leccion?.ejercicios ?? []).map((e) => e.id);
      const nuevoId = idEjercicio(leccionId, existentes.length + 1, existentes);
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        const ejercicio: Ejercicio = {
          id: nuevoId,
          tipo: 'opcion_multiple',
          enunciado: '',
          meta: { tema: '', etiquetas: [], estado: 'borrador' },
          opciones: [{ id: 'op-1', texto: '', esCorrecta: false }],
        };
        return {
          ...actual,
          unidades: actual.unidades.map((u) =>
            u.id === unidadId
              ? {
                  ...u,
                  lecciones: u.lecciones.map((l) =>
                    l.id === leccionId
                      ? { ...l, ejercicios: [...l.ejercicios, ejercicio] }
                      : l,
                  ),
                }
              : u,
          ),
        };
      });
      return nuevoId;
    },
    [curso],
  );

  const editarEjercicio = useCallback(
    (unidadId: string, leccionId: string, ejercicioId: string, ejercicio: Ejercicio) => {
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        // Conserva el id ya referenciado aunque el ejercicio entrante cambie.
        const estable: Ejercicio = {
          ...ejercicio,
          id: asegurarId(ejercicio.id, () => ejercicioId),
        };
        return {
          ...actual,
          unidades: actual.unidades.map((u) =>
            u.id === unidadId
              ? {
                  ...u,
                  lecciones: u.lecciones.map((l) =>
                    l.id === leccionId
                      ? {
                          ...l,
                          ejercicios: l.ejercicios.map((e) =>
                            e.id === ejercicioId ? estable : e,
                          ),
                        }
                      : l,
                  ),
                }
              : u,
          ),
        };
      });
    },
    [],
  );

  const moverEjercicio = useCallback(
    (
      unidadId: string,
      leccionId: string,
      ejercicioId: string,
      direccion: 'subir' | 'bajar',
    ) => {
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        return {
          ...actual,
          unidades: actual.unidades.map((u) => {
            if (u.id !== unidadId) {
              return u;
            }
            return {
              ...u,
              lecciones: u.lecciones.map((l) => {
                if (l.id !== leccionId) {
                  return l;
                }
                const i = l.ejercicios.findIndex((e) => e.id === ejercicioId);
                if (i === -1) {
                  return l;
                }
                return { ...l, ejercicios: mover(l.ejercicios, i, direccion) };
              }),
            };
          }),
        };
      });
    },
    [],
  );

  const eliminarEjercicio = useCallback(
    (unidadId: string, leccionId: string, ejercicioId: string) => {
      setCurso((actual) => {
        if (!actual) {
          return actual;
        }
        return {
          ...actual,
          unidades: actual.unidades.map((u) =>
            u.id === unidadId
              ? {
                  ...u,
                  lecciones: u.lecciones.map((l) =>
                    l.id === leccionId
                      ? { ...l, ejercicios: l.ejercicios.filter((e) => e.id !== ejercicioId) }
                      : l,
                  ),
                }
              : u,
          ),
        };
      });
    },
    [],
  );

  const errores = curso ? erroresCurso(curso) : {};

  return {
    cargando,
    error,
    curso,
    errores,
    editarCurso,
    reemplazarCurso,
    anadirUnidad,
    editarUnidad,
    moverUnidad,
    eliminarUnidad,
    anadirLeccion,
    editarLeccion,
    moverLeccion,
    eliminarLeccion,
    anadirEjercicio,
    editarEjercicio,
    moverEjercicio,
    eliminarEjercicio,
  };
}
