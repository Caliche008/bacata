import { useId } from 'react';
import type { AnalisisFuente } from '../../../content';
import type { RespuestaAnalisisFuente } from '../answers';
import { FuenteCredito } from './FuenteCredito';
import type { RendererProps } from './types';

/**
 * Renderizador de análisis de fuente (9.2, R13.1). Muestra el `recurso` (texto en
 * `<blockquote>` o imagen con su `alt` del contenido) y el crédito de la fuente
 * (R3.8); luego cada pregunta como un grupo de radios accesible. Teclado y
 * etiquetas nativas; el estado no depende del color. Desarrolla pensamiento
 * crítico (contrastar fuentes, identificar perspectivas).
 */
export function AnalisisFuenteRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: RendererProps<AnalisisFuente, RespuestaAnalisisFuente>) {
  const base = useId();

  const elegir = (preguntaId: string, opcionId: string) => {
    onChange({
      tipo: 'analisis_fuente',
      respuestas: { ...respuesta.respuestas, [preguntaId]: opcionId },
    });
  };

  return (
    <div className="bc-fuente-ejercicio">
      <p className="bc-ejercicio__enunciado">{ejercicio.enunciado}</p>

      {ejercicio.recurso.clase === 'texto' ? (
        <blockquote className="bc-fuente-ejercicio__recurso">
          {ejercicio.recurso.contenido}
        </blockquote>
      ) : (
        <img
          className="bc-fuente-ejercicio__imagen"
          src={ejercicio.recurso.src}
          alt={ejercicio.recurso.alt}
        />
      )}

      <FuenteCredito fuente={ejercicio.meta.fuente} />

      {ejercicio.preguntas.map((pregunta, indicePregunta) => {
        const grupo = `${base}-p-${pregunta.id}`;
        return (
          <fieldset
            key={pregunta.id}
            className="bc-ejercicio__fieldset bc-fuente-ejercicio__pregunta"
            disabled={deshabilitado}
          >
            <legend className="bc-ejercicio__enunciado">
              {indicePregunta + 1}. {pregunta.pregunta}
            </legend>
            <ul className="bc-opciones">
              {pregunta.opciones.map((opcion) => {
                const inputId = `${grupo}-${opcion.id}`;
                const seleccionada = respuesta.respuestas[pregunta.id] === opcion.id;
                return (
                  <li key={opcion.id} className="bc-opciones__item">
                    <label
                      className={`bc-opcion ${seleccionada ? 'bc-opcion--activa' : ''}`}
                      htmlFor={inputId}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={grupo}
                        className="bc-opcion__input"
                        checked={seleccionada}
                        disabled={deshabilitado}
                        onChange={() => elegir(pregunta.id, opcion.id)}
                      />
                      <span className="bc-opcion__texto">{opcion.texto}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );
}
