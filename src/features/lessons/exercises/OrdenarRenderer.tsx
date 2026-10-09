import type { Ordenar } from '../../../content';
import { Button } from '../../../components';
import type { RespuestaOrdenar } from '../answers';
import type { RendererProps } from './types';

/**
 * Renderizador de ordenar (9.2, R9.1/R9.4). ALTERNATIVA ACCESIBLE al drag:
 * botones "Subir"/"Bajar" por elemento, operables por teclado y anunciados por
 * lector de pantalla. Cada botón lleva `aria-label` con el texto del elemento y
 * la acción; los botones de los extremos se deshabilitan. Objetivos ≥44px vía
 * `Button`. El orden se refleja por posición y texto, no por color.
 */
export function OrdenarRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: RendererProps<Ordenar, RespuestaOrdenar>) {
  const porId = new Map(ejercicio.elementos.map((elemento) => [elemento.id, elemento]));
  const orden = respuesta.ordenIds;

  const mover = (desde: number, hacia: number) => {
    if (hacia < 0 || hacia >= orden.length) {
      return;
    }
    const nuevo = [...orden];
    const [movido] = nuevo.splice(desde, 1);
    nuevo.splice(hacia, 0, movido);
    onChange({ tipo: 'ordenar', ordenIds: nuevo });
  };

  return (
    <div className="bc-ordenar">
      <p className="bc-ejercicio__enunciado">{ejercicio.enunciado}</p>
      <ol className="bc-ordenar__lista">
        {orden.map((id, posicion) => {
          const elemento = porId.get(id);
          const texto = elemento?.texto ?? id;
          return (
            <li key={id} className="bc-ordenar__item">
              <span className="bc-ordenar__posicion" aria-hidden="true">
                {posicion + 1}.
              </span>
              <span className="bc-ordenar__texto">{texto}</span>
              <span className="bc-ordenar__controles">
                <Button
                  variant="secondary"
                  className="bc-ordenar__boton"
                  disabled={deshabilitado || posicion === 0}
                  aria-label={`Subir: ${texto}`}
                  onClick={() => mover(posicion, posicion - 1)}
                >
                  <span aria-hidden="true">↑</span>
                </Button>
                <Button
                  variant="secondary"
                  className="bc-ordenar__boton"
                  disabled={deshabilitado || posicion === orden.length - 1}
                  aria-label={`Bajar: ${texto}`}
                  onClick={() => mover(posicion, posicion + 1)}
                >
                  <span aria-hidden="true">↓</span>
                </Button>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
