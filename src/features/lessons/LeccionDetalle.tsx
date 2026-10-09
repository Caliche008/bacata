import { Button, Card } from '../../components';

/**
 * Placeholder de la vista de lección (tarea 8). La lección REAL con ejercicios
 * es la tarea 9: aquí solo mostramos título y objetivo de aprendizaje, con una
 * nota de que los ejercicios llegan pronto y un botón para volver a la ruta.
 *
 * Se carga con `React.lazy` desde `RutaAprendizaje` para habilitar
 * code-splitting (R10.1): el estudiante no descarga esta vista hasta tocar una
 * lección disponible.
 */

export interface LeccionDetalleProps {
  titulo: string;
  objetivoAprendizaje: string;
  onVolver: () => void;
}

export default function LeccionDetalle({
  titulo,
  objetivoAprendizaje,
  onVolver,
}: LeccionDetalleProps) {
  return (
    <main className="bc-leccion-detalle">
      <Card title={titulo} className="bc-leccion-detalle__card">
        <p className="bc-leccion-detalle__objetivo">
          <strong>Lo que vas a lograr:</strong> {objetivoAprendizaje}
        </p>
        <p className="bc-leccion-detalle__nota" role="note">
          <span aria-hidden="true">✨ </span>
          Los ejercicios llegan pronto.
        </p>
        <Button variant="secondary" onClick={onVolver}>
          Volver a la ruta
        </Button>
      </Card>
    </main>
  );
}
