import { Fragment, useId } from 'react';
import type { Completar } from '../../../content';
import type { RespuestaCompletar } from '../answers';
import type { RendererProps } from './types';

/**
 * Renderizador de completar (9.2). El `texto` lleva marcadores de hueco (`___`)
 * que se sustituyen, EN ORDEN, por un `<select>` accesible con las `opciones` de
 * cada hueco. Cada select tiene una etiqueta accesible ("Hueco N") asociada por
 * `aria-label`. Teclado y lector de pantalla nativos; sin depender del color.
 *
 * Si el número de marcadores no coincide con el de huecos, se renderizan los
 * selects restantes al final para no perder ninguno (contenido ya validado por
 * Zod en carga, R3.5).
 */
const MARCADOR = /_{2,}/g;

export function CompletarRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: RendererProps<Completar, RespuestaCompletar>) {
  const base = useId();
  const segmentos = ejercicio.texto.split(MARCADOR);
  // Defensa en profundidad: nunca indexar sobre un campo potencialmente
  // `undefined` (p. ej. una respuesta de otro tipo en un render intermedio).
  const selecciones = respuesta.selecciones ?? {};

  const seleccionar = (huecoId: string, valor: string) => {
    onChange({
      tipo: 'completar',
      selecciones: { ...selecciones, [huecoId]: valor === '' ? null : valor },
    });
  };

  const renderSelect = (indice: number) => {
    const hueco = ejercicio.huecos[indice];
    if (!hueco) {
      return null;
    }
    const selectId = `${base}-hueco-${hueco.id}`;
    const valorActual = selecciones[hueco.id];
    return (
      <select
        id={selectId}
        className="bc-completar__select"
        aria-label={`Hueco ${indice + 1}`}
        value={valorActual ?? ''}
        disabled={deshabilitado}
        onChange={(evento) => seleccionar(hueco.id, evento.target.value)}
      >
        <option value="">Elige…</option>
        {hueco.opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    );
  };

  const resto = Math.max(segmentos.length - 1, 0);

  return (
    <div className="bc-completar">
      <p className="bc-ejercicio__enunciado">{ejercicio.enunciado}</p>
      <p className="bc-completar__texto">
        {segmentos.map((segmento, indice) => (
          <Fragment key={`${base}-seg-${indice}`}>
            <span>{segmento}</span>
            {indice < segmentos.length - 1 ? renderSelect(indice) : null}
          </Fragment>
        ))}
        {/* Huecos sin marcador correspondiente (defensivo): se añaden al final. */}
        {ejercicio.huecos.slice(resto).map((hueco, offset) => (
          <Fragment key={`${base}-extra-${hueco.id}`}>{renderSelect(resto + offset)}</Fragment>
        ))}
      </p>
    </div>
  );
}
