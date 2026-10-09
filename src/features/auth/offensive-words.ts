/**
 * Filtro simple de lenguaje ofensivo para apodos (R1.7), en archivo APARTE y
 * mantenible. Lógica pura, sin React.
 *
 * CÓMO AMPLIAR: añade términos en minúsculas y sin tildes a `OFFENSIVE_WORDS`.
 * El cotejo se hace sobre el apodo normalizado (minúsculas, sin tildes, sin
 * separadores), de modo que variantes como "Tóntó" o "t.o.n.t.o" también se
 * detectan. Es DELIBERADAMENTE simple y NO exhaustivo: no sustituye la
 * moderación humana. El docente puede renombrar o eliminar perfiles con apodos
 * inapropiados (R6.6, tarea 14).
 *
 * La lista se mantiene acotada y neutral en el repositorio: insultos genéricos
 * en español, sin reproducir lenguaje discriminatorio explícito.
 */

/** Lista base, ampliable. Términos en minúsculas y sin tildes. */
export const OFFENSIVE_WORDS: readonly string[] = [
  'tonto',
  'tonta',
  'estupido',
  'estupida',
  'idiota',
  'imbecil',
  'bobo',
  'boba',
  'burro',
  'burra',
  'maldito',
  'maldita',
  'odio',
  'puto',
  'puta',
  'mierda',
  'marica',
  'malparido',
  'malparida',
  'gonorrea',
  'hpta',
];

/**
 * Normaliza para el cotejo: minúsculas, sin tildes y conservando solo letras y
 * números (quita espacios, puntos y otros separadores que suelen usarse para
 * evadir filtros simples).
 */
function normalizeForMatch(raw: string): string {
  return raw
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ]/g, '');
}

/**
 * Verdadero si el apodo contiene algún término de la lista (coincidencia por
 * subcadena sobre el valor normalizado). Devolver solo un booleano evita
 * registrar o exponer el término detectado.
 */
export function containsOffensiveLanguage(raw: string): boolean {
  const normalized = normalizeForMatch(raw);
  if (normalized.length === 0) {
    return false;
  }
  return OFFENSIVE_WORDS.some((word) => normalized.includes(word));
}
