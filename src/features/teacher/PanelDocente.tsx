import { useState } from 'react';
import { Button } from '../../components';
import { isTeacherSessionActive, setClassGrade } from '../../lib/preferences';
import { AccesoDocente } from './AccesoDocente';
import { GestionClases } from './GestionClases';
import { GestionEstudiantes } from './GestionEstudiantes';
import { ProgresoClase } from './ProgresoClase';
import { UnidadesClase } from './UnidadesClase';
import { cerrarSesionDocente } from './teacher-access';
import { setUnidadesActivas } from './classes-service';
import { eliminarEstudiante, renombrarApodo } from './students-service';
import { useTeacherPanel } from './useTeacherPanel';
import './teacher.css';

export interface PanelDocenteProps {
  /** Vuelve al acceso del estudiante (cierra el panel). */
  onSalir: () => void;
}

type Seccion = 'clases' | 'progreso' | 'unidades' | 'estudiantes';

const SECCIONES: { id: Seccion; etiqueta: string }[] = [
  { id: 'clases', etiqueta: 'Clases' },
  { id: 'progreso', etiqueta: 'Progreso' },
  { id: 'unidades', etiqueta: 'Unidades' },
  { id: 'estudiantes', etiqueta: 'Estudiantes' },
];

/**
 * Shell del panel docente (R6.5). Si no hay sesión docente activa, renderiza el
 * acceso (`AccesoDocente`). Con sesión, muestra la navegación entre secciones
 * (Clases, Progreso, Unidades, Estudiantes) y un botón "Salir del panel" que
 * cierra la sesión docente y vuelve al acceso del estudiante.
 */
export function PanelDocente({ onSalir }: PanelDocenteProps) {
  const [autenticado, setAutenticado] = useState(() => isTeacherSessionActive());
  const [seccion, setSeccion] = useState<Seccion>('clases');
  const panel = useTeacherPanel();

  if (!autenticado) {
    return <AccesoDocente onEntrar={() => setAutenticado(true)} />;
  }

  const {
    cargando,
    error,
    clases,
    claseSeleccionada,
    gradoSeleccionado,
    curso,
    resumen,
    seleccionarClase,
    cambiarGrado,
    nuevaClase,
    regenerar,
    recargar,
  } = panel;

  const salir = () => {
    cerrarSesionDocente();
    setAutenticado(false);
    onSalir();
  };

  const guardarUnidades = async (idsActivos: string[]) => {
    if (!claseSeleccionada) {
      return;
    }
    await setUnidadesActivas(claseSeleccionada.id, idsActivos);
    recargar();
  };

  const estudiantes = resumen.map((r) => ({
    estudianteId: r.estudianteId,
    apodo: r.apodo,
  }));

  return (
    <main className="bc-teacher">
      <div className="bc-teacher__header">
        <h1 className="bc-teacher__title">Panel del docente</h1>
        <Button variant="ghost" onClick={salir}>
          Salir del panel
        </Button>
      </div>

      <p className="bc-teacher__nota" role="note">
        Modo local: la información vive en este dispositivo. En una próxima versión habrá
        cuentas de docente y sincronización.
      </p>

      <nav className="bc-teacher__nav" aria-label="Secciones del panel">
        {SECCIONES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="bc-teacher__tab"
            aria-current={seccion === item.id ? 'page' : undefined}
            onClick={() => setSeccion(item.id)}
          >
            {item.etiqueta}
          </button>
        ))}
      </nav>

      {cargando ? (
        <p aria-busy="true">Cargando…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          {seccion === 'clases' ? (
            <GestionClases
              clases={clases}
              claseSeleccionada={claseSeleccionada}
              onSeleccionar={seleccionarClase}
              onCrear={nuevaClase}
              onRegenerar={regenerar}
            />
          ) : null}

          {seccion === 'progreso' ? <ProgresoClase resumen={resumen} /> : null}

          {seccion === 'unidades' ? (
            !claseSeleccionada ? (
              <p className="bc-teacher__vacio">
                Crea o selecciona una clase para gestionar sus unidades.
              </p>
            ) : !curso ? (
              <p className="bc-teacher__vacio">
                No hay contenido para el grado {gradoSeleccionado}°.
              </p>
            ) : (
              <>
                <fieldset className="bc-teacher__field">
                  <legend className="bc-teacher__label">Grado a gestionar</legend>
                  <div className="bc-teacher__grados" role="radiogroup" aria-label="Grado a gestionar">
                    {([6, 7] as const).map((valor) => {
                      const checked = gradoSeleccionado === valor;
                      return (
                        <label
                          key={valor}
                          className={`bc-teacher__grado${
                            checked ? ' bc-teacher__grado--activo' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="grado-gestion"
                            className="bc-teacher__radio"
                            value={valor}
                            checked={checked}
                            onChange={() => {
                              cambiarGrado(valor);
                              setClassGrade(claseSeleccionada.id, valor);
                            }}
                          />
                          <span>{valor}°</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <UnidadesClase
                  curso={curso}
                  unidadesActivas={claseSeleccionada.unidadesActivas}
                  mostrarTodasPorDefecto={claseSeleccionada.unidadesActivas.length === 0}
                  onCambiar={guardarUnidades}
                />
              </>
            )
          ) : null}

          {seccion === 'estudiantes' ? (
            <GestionEstudiantes
              estudiantes={estudiantes}
              onRenombrar={async (id, apodo) => {
                const resultado = await renombrarApodo(id, apodo);
                if (resultado.ok) {
                  recargar();
                }
                return resultado;
              }}
              onEliminar={async (id) => {
                await eliminarEstudiante(id);
                recargar();
              }}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
