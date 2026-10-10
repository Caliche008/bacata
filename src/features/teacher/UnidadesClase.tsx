import { Card } from '../../components';
import { listarUnidades, type Curso } from '../../content';
import './teacher.css';

export interface UnidadesClaseProps {
  curso: Curso;
  /** Ids de unidad actualmente activas (a MOSTRAR) según la clase. */
  unidadesActivas: string[];
  /**
   * Si la clase guarda la lista explícita de activas (no vacía) se respeta; si
   * está vacía, por el fallback de la ruta se muestran TODAS (ver `path.ts`).
   */
  mostrarTodasPorDefecto: boolean;
  onCambiar: (idsActivos: string[]) => Promise<void> | void;
}

/**
 * Activar/desactivar unidades por clase (R6.3, R6.4). Lista las unidades del
 * grado de la clase; cada una tiene un interruptor accesible
 * (`role="switch"` + `aria-checked`) con texto "Activa/Oculta" (no solo color)
 * y objetivo táctil >= 44px (CSS).
 *
 * Al cambiar, se escribe la LISTA EXPLÍCITA de ids de unidad a MOSTRAR —el
 * formato que consume `useRuta`—, de modo que una unidad oculta desaparece de
 * la ruta del estudiante (R6.4). Nota: si no se oculta ninguna, se muestran
 * todas (fallback del MVP).
 */
export function UnidadesClase({
  curso,
  unidadesActivas,
  mostrarTodasPorDefecto,
  onCambiar,
}: UnidadesClaseProps) {
  const unidades = listarUnidades(curso);
  const activasSet = new Set(unidadesActivas);

  // Cuando la lista guardada está vacía (fallback = todas), la UI muestra todas
  // como activas para reflejar lo que el estudiante ve.
  const esActiva = (id: string): boolean =>
    mostrarTodasPorDefecto ? true : activasSet.has(id);

  const alternar = (id: string) => {
    // Punto de partida: la lista EXPLÍCITA de ids actualmente visibles.
    const base = mostrarTodasPorDefecto ? unidades.map((u) => u.id) : [...unidadesActivas];
    const visibles = new Set(base);
    if (visibles.has(id)) {
      visibles.delete(id);
    } else {
      visibles.add(id);
    }
    // Se persiste en el orden del curso para estabilidad.
    const ordenados = unidades.map((u) => u.id).filter((uid) => visibles.has(uid));
    void onCambiar(ordenados);
  };

  return (
    <section className="bc-teacher__section" aria-label="Unidades de la clase">
      <p className="bc-teacher__nota" role="note">
        Activa u oculta unidades para esta clase. Si no ocultas ninguna, se muestran
        todas.
      </p>
      <Card title="Unidades del grado" headingLevel={3}>
        <ul className="bc-teacher__list">
          {unidades.map((unidad) => {
            const activa = esActiva(unidad.id);
            return (
              <li key={unidad.id} className="bc-teacher__item">
                <span>
                  {unidad.titulo}
                  {unidad.ejePaz ? (
                    <span className="bc-teacher__paz"> · Cátedra de la Paz</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={activa}
                  className="bc-teacher__switch"
                  onClick={() => alternar(unidad.id)}
                >
                  <span aria-hidden="true">{activa ? '✓' : '✕'}</span>
                  {activa ? 'Activa' : 'Oculta'}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
