import { useId, useMemo } from 'react';
import type { Emparejar } from '../../../content';
import type { RespuestaEmparejar } from '../answers';
import type { RendererProps } from './types';

/**
 * Renderizador de emparejar (9.2). Por cada lado izquierdo, un `<select>`
 * accesible (con etiqueta visible) para elegir su derecha. Las derechas se
 * barajan SOLO en presentación con un orden estable por render; el valor
 * guardado es el ÍNDICE ORIGINAL del par, que es lo que evalúa el evaluador.
 * `<select>` nativo da teclado y lectura por lector de pantalla sin drag.
 */
export function EmparejarRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: RendererProps<Emparejar, RespuestaEmparejar>) {
  const base = useId();

  // Orden de presentación de las derechas (barajado estable por montaje).
  const derechasPresentadas = useMemo(() => {
    const indices = ejercicio.pares.map((_, indice) => indice);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [ejercicio.pares]);

  // Defensa en profundidad: nunca indexar sobre un campo potencialmente
  // `undefined` (p. ej. una respuesta de otro tipo en un render intermedio).
  const asignaciones = respuesta.asignaciones ?? {};

  const asignar = (izquierdaIndex: number, valor: string) => {
    const derechaIndex = valor === '' ? null : Number(valor);
    onChange({
      tipo: 'emparejar',
      asignaciones: { ...asignaciones, [izquierdaIndex]: derechaIndex },
    });
  };

  return (
    <div className="bc-emparejar">
      <p className="bc-ejercicio__enunciado">{ejercicio.enunciado}</p>
      <ul className="bc-emparejar__lista">
        {ejercicio.pares.map((par, izquierdaIndex) => {
          const selectId = `${base}-izq-${izquierdaIndex}`;
          const valorActual = asignaciones[izquierdaIndex];
          return (
            <li key={par.izquierda} className="bc-emparejar__fila">
              <label className="bc-emparejar__izquierda" htmlFor={selectId}>
                {par.izquierda}
              </label>
              <select
                id={selectId}
                className="bc-emparejar__select"
                value={valorActual == null ? '' : String(valorActual)}
                disabled={deshabilitado}
                onChange={(evento) => asignar(izquierdaIndex, evento.target.value)}
              >
                <option value="">Elige una opción…</option>
                {derechasPresentadas.map((derechaIndex) => (
                  <option key={derechaIndex} value={String(derechaIndex)}>
                    {ejercicio.pares[derechaIndex].derecha}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
