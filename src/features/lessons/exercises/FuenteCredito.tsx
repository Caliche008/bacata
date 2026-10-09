import type { Fuente } from '../../../content';

/**
 * Crédito de fuente (R3.8). Renderiza título/autor/año/url de la `fuente` de un
 * ejercicio o de su `meta`. Si no hay fuente, no renderiza nada. El enlace, si
 * existe, es accesible (texto descriptivo + `rel` seguro).
 */

export interface FuenteCreditoProps {
  fuente?: Fuente;
}

export function FuenteCredito({ fuente }: FuenteCreditoProps) {
  if (!fuente) {
    return null;
  }

  const partes = [fuente.autor, fuente.anio ? String(fuente.anio) : undefined].filter(Boolean);

  return (
    <p className="bc-fuente">
      <span className="bc-fuente__etiqueta">Fuente: </span>
      <cite className="bc-fuente__titulo">{fuente.titulo}</cite>
      {partes.length > 0 ? (
        <span className="bc-fuente__detalle"> — {partes.join(', ')}</span>
      ) : null}
      {fuente.url ? (
        <>
          {' '}
          <a
            className="bc-fuente__enlace"
            href={fuente.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver la fuente (se abre en una pestaña nueva)
          </a>
        </>
      ) : null}
    </p>
  );
}
