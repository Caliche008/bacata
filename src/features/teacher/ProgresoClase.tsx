import { Card, ProgressBar } from '../../components';
import type { ResumenEstudiante } from './progress-service';
import './teacher.css';

export interface ProgresoClaseProps {
  resumen: ResumenEstudiante[];
}

/**
 * Icono de la Cátedra de la Paz (marca por icono + texto, no solo color).
 */
function IconoPaz() {
  return (
    <svg
      className="bc-teacher__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M12 12l6-4M12 12l-6-4" />
    </svg>
  );
}

/**
 * Lista de progreso por estudiante (R6.2). Muestra el APODO (sin PII) y el
 * porcentaje por unidad con `ProgressBar` accesible. La Cátedra de la Paz se
 * marca con icono + texto. NUNCA se renderiza el hash docente ni PII (el resumen
 * ya viene sin esos datos desde `progress-service`).
 */
export function ProgresoClase({ resumen }: ProgresoClaseProps) {
  return (
    <section className="bc-teacher__section" aria-label="Progreso de la clase">
      {resumen.length === 0 ? (
        <p className="bc-teacher__vacio">
          Todavía no hay estudiantes en esta clase. Comparte el código para que entren.
        </p>
      ) : (
        <ul className="bc-teacher__list">
          {resumen.map((estudiante) => (
            <li key={estudiante.estudianteId}>
              <Card
                title={estudiante.apodo}
                headingLevel={3}
                as="article"
              >
                <p>
                  {estudiante.leccionesCompletadas} de {estudiante.totalLecciones}{' '}
                  lecciones completadas
                </p>
                <ul className="bc-teacher__list">
                  {estudiante.porUnidad.map((unidad) => (
                    <li key={unidad.unidadId}>
                      <ProgressBar
                        value={unidad.porcentaje}
                        label={unidad.titulo}
                      />
                      {unidad.ejePaz ? (
                        <span className="bc-teacher__paz">
                          <IconoPaz />
                          Cátedra de la Paz
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
