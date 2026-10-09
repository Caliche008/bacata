import { useEffect, useRef } from 'react';
import { Button, ProgressBar } from '../../components';
import type { Curso } from '../../content';
import { Mascota, getMomento } from '../mascota';
import type { AvanceEjePaz } from './gamification';
import {
  LOGROS,
  PREFIJO_UNIDAD_COMPLETADA,
  logroUnidadCompletada,
  type LogroDef,
} from './logros';
import './progress.css';

/**
 * Panel "Mi progreso" (tarea 10.3, R4.3/R12.5): diálogo accesible que lista los
 * logros obtenidos y el avance en el eje de la Cátedra de la Paz.
 *
 * Accesibilidad:
 * - `role="dialog"` + `aria-modal`; al abrir, el foco va al botón "Cerrar";
 *   `Escape` cierra; el foco queda contenido (patrón de `CelebracionUnidad`).
 * - Cada logro combina ícono (`aria-hidden`) + TEXTO (título y descripción): la
 *   información nunca depende solo del color.
 * - El % de eje Paz usa `ProgressBar`, que ya anuncia el valor por ARIA y texto.
 * - La mascota aparece "celebrando" cuando hay logros (protagonismo), decorativa.
 *
 * Sin rankings ni comparaciones entre estudiantes (R4.4). Sin PII.
 */

export interface PanelProgresoProps {
  logros: string[];
  avanceEjePaz: AvanceEjePaz;
  curso: Curso;
  onCerrar: () => void;
}

/**
 * Resuelve la definición (título + descripción) de un id de logro contra el
 * catálogo fijo (`LOGROS`) y los logros de unidad derivados del curso. Si no se
 * reconoce, devuelve una definición genérica para no romper la vista.
 */
function resolverLogro(id: string, curso: Curso): LogroDef {
  const fijo = LOGROS.find((logro) => logro.id === id);
  if (fijo) {
    return fijo;
  }
  if (id.startsWith(PREFIJO_UNIDAD_COMPLETADA)) {
    const unidadId = id.slice(PREFIJO_UNIDAD_COMPLETADA.length);
    const unidad = curso.unidades.find((item) => item.id === unidadId);
    if (unidad) {
      return logroUnidadCompletada(unidad);
    }
  }
  return { id, titulo: 'Logro obtenido', descripcion: '¡Buen trabajo!' };
}

export function PanelProgreso({ logros, avanceEjePaz, curso, onCerrar }: PanelProgresoProps) {
  const dialogoRef = useRef<HTMLDivElement>(null);
  const acierto = getMomento('acierto');
  const tieneLogros = logros.length > 0;

  useEffect(() => {
    const dialogo = dialogoRef.current;
    const cerrar = dialogo?.querySelector<HTMLButtonElement>('button');
    cerrar?.focus();

    const onKeyDown = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        onCerrar();
        return;
      }
      if (evento.key === 'Tab' && cerrar) {
        // Un único control (Cerrar): se retiene el foco dentro del diálogo.
        evento.preventDefault();
        cerrar.focus();
      }
    };

    dialogo?.addEventListener('keydown', onKeyDown);
    return () => dialogo?.removeEventListener('keydown', onKeyDown);
  }, [onCerrar]);

  return (
    <div className="bc-panel-progreso__overlay">
      <div
        ref={dialogoRef}
        className="bc-panel-progreso"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bc-panel-progreso-titulo"
      >
        <div className="bc-panel-progreso__cabecera">
          <h2 id="bc-panel-progreso-titulo" className="bc-panel-progreso__titulo">
            Mi progreso
          </h2>
          <Button variant="ghost" onClick={onCerrar}>
            Cerrar
          </Button>
        </div>

        {tieneLogros ? (
          <Mascota pose="celebrando" size="md" message={acierto.mensaje} decorative />
        ) : null}

        <section aria-labelledby="bc-panel-progreso-logros">
          <h3 id="bc-panel-progreso-logros" className="bc-panel-progreso__seccion-titulo">
            Tus logros
          </h3>
          {tieneLogros ? (
            <ul className="bc-panel-progreso__logros">
              {logros.map((id) => {
                const logro = resolverLogro(id, curso);
                return (
                  <li key={id} className="bc-panel-progreso__logro">
                    <span className="bc-panel-progreso__logro-icono" aria-hidden="true">
                      🏅
                    </span>
                    <div>
                      <p className="bc-panel-progreso__logro-titulo">{logro.titulo}</p>
                      <p className="bc-panel-progreso__logro-desc">{logro.descripcion}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="bc-panel-progreso__vacio">
              Aún no tienes logros. Completa una lección y tu primer logro llegará pronto.
            </p>
          )}
        </section>

        <section aria-labelledby="bc-panel-progreso-paz">
          <h3 id="bc-panel-progreso-paz" className="bc-panel-progreso__seccion-titulo">
            Cátedra de la Paz
          </h3>
          <ProgressBar
            value={avanceEjePaz.porcentaje}
            label={`Avance en la Cátedra de la Paz: ${avanceEjePaz.completadas} de ${avanceEjePaz.total} lecciones`}
          />
        </section>
      </div>
    </div>
  );
}
