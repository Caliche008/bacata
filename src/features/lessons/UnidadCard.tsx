import { Card, ProgressBar } from '../../components';
import { LeccionItem } from './LeccionItem';
import type { UnidadVista } from './path';

/**
 * Tarjeta de una unidad en la ruta. Muestra el título, la Cátedra de la Paz
 * como insignia DENTRO de la unidad (eje transversal, no módulo aparte, R2.5)
 * con ícono + texto, el porcentaje con el `ProgressBar` accesible (R2.6) y la
 * lista de lecciones. Una unidad sin lecciones se marca como "Próximamente"
 * (ícono + texto), nunca solo por color.
 */

export interface UnidadCardProps {
  unidad: UnidadVista;
  onSelectLeccion: (leccionId: string) => void;
}

export function UnidadCard({ unidad, onSelectLeccion }: UnidadCardProps) {
  return (
    <Card as="article" title={unidad.titulo} headingLevel={3} className="bc-unidad">
      {unidad.ejePaz ? (
        <p className="bc-unidad__paz">
          <span className="bc-unidad__paz-icono" aria-hidden="true">
            🕊️
          </span>
          Cátedra de la Paz
        </p>
      ) : null}

      <p className="bc-unidad__desc">{unidad.descripcion}</p>

      <ProgressBar
        value={unidad.porcentaje}
        label={`Progreso de ${unidad.titulo}`}
      />

      {unidad.vacia ? (
        <p className="bc-unidad__proximamente" role="note">
          <span aria-hidden="true">⏳ </span>
          Próximamente: estamos preparando estas lecciones.
        </p>
      ) : (
        <ul className="bc-unidad__lecciones">
          {unidad.lecciones.map((leccion) => (
            <LeccionItem
              key={leccion.id}
              leccion={leccion}
              onSelect={onSelectLeccion}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
