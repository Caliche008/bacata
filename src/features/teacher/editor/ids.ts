import type { Grado } from '../../../content/types';

/**
 * Helpers PUROS para generar identificadores estables y legibles del contenido
 * (unidades, lecciones, ejercicios) en el editor del docente.
 *
 * No tocan IndexedDB ni dependen de React: solo transforman cadenas. Los ids
 * resultantes son `kebab-case` sin tildes ni signos, deterministas para una
 * misma entrada y únicos frente a un conjunto de ids ya existentes.
 */

/**
 * Convierte un texto a `kebab-case` sin tildes ni signos: normaliza (NFD) para
 * separar los diacríticos, los elimina, pasa a minúsculas y reemplaza todo lo
 * que no sea `a-z0-9` por guiones, colapsando y recortando guiones sobrantes.
 */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/**
 * Garantiza unicidad de `base` frente a `existentes`: si ya existe, añade un
 * sufijo incremental `-2`, `-3`, … hasta encontrar uno libre.
 */
function unico(base: string, existentes: Iterable<string>): string {
  const usados = new Set(existentes);
  if (!usados.has(base)) {
    return base;
  }
  let n = 2;
  while (usados.has(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}

/** `u<grado>-<slug(titulo)>`, único frente a `existentes`. */
export function idUnidad(grado: Grado, titulo: string, existentes: Iterable<string>): string {
  return unico(`u${grado}-${slugify(titulo)}`, existentes);
}

/** `l<grado>-<unidadSlug>-<slug(titulo)>`, único frente a `existentes`. */
export function idLeccion(
  grado: Grado,
  unidadSlug: string,
  titulo: string,
  existentes: Iterable<string>,
): string {
  return unico(`l${grado}-${slugify(unidadSlug)}-${slugify(titulo)}`, existentes);
}

/** `e<leccionId>-<slug(n|titulo)>`, único frente a `existentes`. */
export function idEjercicio(
  leccionId: string,
  nOTitulo: number | string,
  existentes: Iterable<string>,
): string {
  const sufijo = typeof nOTitulo === 'number' ? String(nOTitulo) : slugify(nOTitulo);
  return unico(`e${slugify(leccionId)}-${sufijo}`, existentes);
}

/**
 * Conserva `idActual` si ya es un id no vacío (estabilidad al editar); si no,
 * genera uno nuevo con `generador`. Así renombrar un título no rompe los ids ya
 * referenciados.
 */
export function asegurarId(idActual: string | undefined, generador: () => string): string {
  if (idActual && idActual.trim().length > 0) {
    return idActual;
  }
  return generador();
}
