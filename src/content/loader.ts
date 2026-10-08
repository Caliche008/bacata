import { getCachedCourse, putCachedCourse } from '../lib/storage';
import { cursoSchema } from './schema';
import type { Curso, Grado, Leccion, Unidad } from './types';

/**
 * Loader de contenido pedagógico de Bacatá (tarea 5).
 *
 * Esta capa vive en `src/content`, NO conoce React y NO hace fetch de red: el
 * contenido empaquetado (`content/cursos/*.json`) se incrusta en el bundle con
 * `import.meta.glob` eager, de modo que la app funciona offline desde el primer
 * arranque. Habla con IndexedDB SOLO a través de `src/lib/storage` (nunca
 * directo).
 *
 * Flujo: cada módulo JSON se valida con `cursoSchema` (fuente única de la
 * verdad en `schema.ts`); un curso que no valida se EXCLUYE sin romper la app,
 * dejando una traza mínima y no sensible (ruta + ruta de campo Zod, nunca el
 * contenido completo — Ley 1581). Tras validar, se filtran los ejercicios en
 * `estado: 'borrador'` (R7.8): solo contenido aprobado llega al estudiante. El
 * loader nunca genera ni reescribe ids (R7.6).
 */

/** Índice en memoria sobre el que operan los selectores (puros). */
export interface ContentIndex {
  /** Solo cursos válidos, ya filtrados (sin ejercicios en borrador). */
  cursosPorGrado: Map<Grado, Curso>;
}

/** Traza mínima y no sensible de un curso empaquetado que no pudo cargarse. */
export interface ContentLoadError {
  /** Ruta del módulo JSON de origen. */
  archivo: string;
  /** Rutas de campo (Zod) con su mensaje; nunca el contenido del campo. */
  problemas: { ruta: string; mensaje: string }[];
}

/**
 * Módulos JSON empaquetados. `eager: true` los incrusta en build-time (sin
 * fetch); se tipan como `unknown` para forzar el paso por `cursoSchema` antes
 * de tratarlos como `Curso`.
 */
const modulosEmpaquetados = import.meta.glob('../../content/cursos/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

/** Quita los ejercicios en borrador de una lección, conservando el resto. */
function filtrarEjerciciosAprobados(leccion: Leccion): Leccion {
  return {
    ...leccion,
    ejercicios: leccion.ejercicios.filter((ejercicio) => ejercicio.meta.estado !== 'borrador'),
  };
}

/**
 * Devuelve una copia del curso sin ejercicios en borrador. Preserva unidades,
 * lecciones, metadatos de Cátedra de la Paz (`ejePaz`, `catedraPaz`) y los ids
 * tal cual (no reordena ni regenera nada).
 */
export function filtrarCursoAprobado(curso: Curso): Curso {
  return {
    ...curso,
    unidades: curso.unidades.map(
      (unidad): Unidad => ({
        ...unidad,
        lecciones: unidad.lecciones.map(filtrarEjerciciosAprobados),
      }),
    ),
  };
}

/**
 * Compara dos versiones semánticas (`"0.2.0"`). Devuelve `true` si `a` es más
 * nueva que `b`. Si alguna no es semver (`major.minor.patch` numérico), cae a
 * una comparación de cadena con `localeCompare`.
 */
export function isNewerVersion(a: string, b: string): boolean {
  const parse = (v: string): [number, number, number] | null => {
    const partes = v.trim().split('.');
    if (partes.length !== 3) return null;
    const nums = partes.map((p) => Number(p));
    if (nums.some((n) => !Number.isInteger(n) || n < 0)) return null;
    return [nums[0], nums[1], nums[2]];
  };

  const pa = parse(a);
  const pb = parse(b);
  if (pa && pb) {
    for (let i = 0; i < 3; i += 1) {
      if (pa[i] !== pb[i]) return pa[i] > pb[i];
    }
    return false;
  }
  return a.localeCompare(b) > 0;
}

/**
 * Valida un módulo de contenido crudo contra `cursoSchema`. Si valida, devuelve
 * el curso ya filtrado (sin ejercicios en borrador); si no, devuelve una traza
 * mínima y no sensible (ruta de archivo + rutas de campo Zod, nunca el
 * contenido). No lanza: la degradación es responsabilidad de quien lo llama.
 */
export function validarYFiltrarCurso(
  archivo: string,
  datos: unknown,
): { ok: true; curso: Curso } | { ok: false; error: ContentLoadError } {
  const resultado = cursoSchema.safeParse(datos);
  if (!resultado.success) {
    const problemas = resultado.error.issues.map((issue) => ({
      ruta: issue.path.length > 0 ? issue.path.join('.') : '(raíz)',
      mensaje: issue.message,
    }));
    return { ok: false, error: { archivo, problemas } };
  }
  return { ok: true, curso: filtrarCursoAprobado(resultado.data) };
}

/**
 * Carga y valida el contenido empaquetado. Los cursos válidos (ya filtrados)
 * se indexan por grado; los inválidos se recogen en `errores` sin romper la
 * carga.
 */
export function loadBundledCourses(): { index: ContentIndex; errores: ContentLoadError[] } {
  const cursosPorGrado = new Map<Grado, Curso>();
  const errores: ContentLoadError[] = [];

  for (const [archivo, datos] of Object.entries(modulosEmpaquetados)) {
    const resultado = validarYFiltrarCurso(archivo, datos);
    if (!resultado.ok) {
      errores.push(resultado.error);
      if (import.meta.env.DEV) {
        console.error(
          `[content] Curso excluido (${archivo}): no cumple el esquema.`,
          resultado.error.problemas,
        );
      } else {
        console.warn('[content] Un curso empaquetado se excluyó por no cumplir el esquema.');
      }
      continue;
    }

    cursosPorGrado.set(resultado.curso.grado, resultado.curso);
  }

  return { index: { cursosPorGrado }, errores };
}

/**
 * Sincroniza la caché por grado (`src/lib/storage`) con el contenido
 * empaquetado: escribe cuando no hay caché o cuando el empaquetado es más
 * nuevo (R7.4). Un fallo de almacenamiento (cuota, modo privado) no rompe el
 * arranque: se registra un aviso mínimo y se sigue sirviendo desde memoria.
 */
async function sincronizarCache(index: ContentIndex): Promise<void> {
  for (const [grado, curso] of index.cursosPorGrado) {
    try {
      const cacheado = await getCachedCourse(grado);
      if (!cacheado || isNewerVersion(curso.version, cacheado.version)) {
        await putCachedCourse(grado, curso.version, curso);
      }
    } catch {
      console.warn(`[content] No se pudo cachear el contenido del grado ${grado}; se usa memoria.`);
    }
  }
}

/**
 * Inicializa el contenido: carga el empaquetado válido y sincroniza la caché
 * por grado. La fuente de verdad para los selectores es el índice en memoria;
 * la caché es persistencia/optimización y no es obligatoria para funcionar.
 */
export async function initContent(): Promise<ContentIndex> {
  const { index } = loadBundledCourses();
  await sincronizarCache(index);
  return index;
}
