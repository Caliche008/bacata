import { useRef, useState } from 'react';
import { Button, Card } from '../../../components';
import { GRADOS_SOPORTADOS } from '../../../content';
import type { Ejercicio, Grado } from '../../../content/types';
import { CursoForm } from './CursoForm';
import { EjercicioForm } from './EjercicioForm';
import { LeccionForm } from './LeccionForm';
import { PreviewEjercicio } from './PreviewEjercicio';
import { UnidadForm } from './UnidadForm';
import { exportarCurso, importarCurso } from './exportImport';
import { useEditorContenido } from './useEditorContenido';
import { erroresEjercicio, erroresLeccion, erroresUnidad } from './validation';
import './editor.css';

export interface EditorContenidoProps {
  /** Vuelve a la sección anterior del panel (opcional). */
  onSalir?: () => void;
}

/** Mensaje de resultado de una acción (exportar/importar), con tono para el estilo. */
interface Aviso {
  tono: 'ok' | 'error';
  texto: string;
}

/**
 * Shell del editor de contenido local del docente. Navega por estado
 * (grado → curso → unidad → lección → ejercicio) sin React Router, reutilizando
 * los formularios de FEAT-002/003 y la previsualización que monta el
 * `ExerciseRenderer` del estudiante.
 *
 * Los borradores son LOCALES: viven en este dispositivo (store
 * `borradoresContenido`) y NO cambian lo que ven los estudiantes hasta que el
 * contenido se publica por el flujo de contenido empaquetado. El editor queda
 * tras el acceso docente; un estudiante nunca lo ve.
 */
export function EditorContenido({ onSalir }: EditorContenidoProps) {
  const [grado, setGrado] = useState<Grado>(GRADOS_SOPORTADOS[0]);
  const editor = useEditorContenido(grado);

  const [unidadSel, setUnidadSel] = useState<string | null>(null);
  const [leccionSel, setLeccionSel] = useState<string | null>(null);
  const [ejercicioSel, setEjercicioSel] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const { cargando, error, curso } = editor;

  const unidad = curso?.unidades.find((u) => u.id === unidadSel) ?? null;
  const leccion = unidad?.lecciones.find((l) => l.id === leccionSel) ?? null;
  const ejercicio = leccion?.ejercicios.find((e) => e.id === ejercicioSel) ?? null;

  const limpiarSeleccion = () => {
    setUnidadSel(null);
    setLeccionSel(null);
    setEjercicioSel(null);
  };

  const cambiarGrado = (g: Grado) => {
    setGrado(g);
    limpiarSeleccion();
    setAviso(null);
  };

  const exportar = () => {
    if (!curso) {
      return;
    }
    const resultado = exportarCurso(curso);
    if (resultado.ok) {
      setAviso({ tono: 'ok', texto: 'Listo: descargamos el curso como archivo JSON.' });
    } else {
      setAviso({
        tono: 'error',
        texto: `No pudimos exportar: revisa estos puntos. ${(resultado.errores ?? []).join(' · ')}`,
      });
    }
  };

  const alElegirArchivo = async (archivo: File) => {
    const texto = await archivo.text();
    const resultado = importarCurso(texto);
    if (resultado.ok) {
      setGrado(resultado.curso.grado);
      limpiarSeleccion();
      editor.reemplazarCurso(resultado.curso);
      setAviso({ tono: 'ok', texto: 'Importamos el curso. Revísalo antes de exportarlo.' });
    } else {
      setAviso({
        tono: 'error',
        texto: `No pudimos importar el archivo. ${resultado.errores.join(' · ')}`,
      });
    }
  };

  return (
    <div className="bc-editor__shell">
      <div className="bc-editor__shell-encabezado">
        <h2 className="bc-teacher__title">Editor de contenido</h2>
        {onSalir ? (
          <Button variant="ghost" onClick={onSalir}>
            Volver
          </Button>
        ) : null}
      </div>

      <p className="bc-editor__nota" role="note">
        Los borradores son locales y NO cambian lo que ven los estudiantes. Edita aquí, exporta
        el JSON y entrégalo por el flujo de contenido para publicarlo.
      </p>

      <fieldset className="bc-editor__field">
        <legend className="bc-editor__label">Grado del borrador</legend>
        <div className="bc-editor__grados" role="radiogroup" aria-label="Grado del borrador">
          {GRADOS_SOPORTADOS.map((valor) => {
            const checked = grado === valor;
            return (
              <label
                key={valor}
                className={`bc-editor__grado${checked ? ' bc-editor__grado--activo' : ''}`}
              >
                <input
                  type="radio"
                  name="editor-grado"
                  className="bc-editor__radio"
                  value={valor}
                  checked={checked}
                  onChange={() => cambiarGrado(valor)}
                />
                <span>{valor}°</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="bc-editor__acciones">
        <Button variant="secondary" onClick={exportar} disabled={!curso}>
          Exportar curso (JSON)
        </Button>
        <Button variant="secondary" onClick={() => inputArchivo.current?.click()}>
          Importar curso (JSON)
        </Button>
        <input
          ref={inputArchivo}
          type="file"
          accept="application/json,.json"
          className="bc-editor__file"
          aria-label="Importar curso desde un archivo JSON"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            // Permite re-elegir el mismo archivo: limpia el valor del input.
            e.target.value = '';
            if (archivo) {
              void alElegirArchivo(archivo);
            }
          }}
        />
      </div>

      {aviso ? (
        <p role="alert" className={`bc-editor__aviso bc-editor__aviso--${aviso.tono}`}>
          <span aria-hidden="true" className="bc-editor__aviso-icono">
            {aviso.tono === 'ok' ? '✓' : '⚠'}
          </span>
          <span>{aviso.texto}</span>
        </p>
      ) : null}

      {cargando ? (
        <p aria-busy="true">Cargando el borrador…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : !curso ? null : (
        <>
          <CursoForm
            curso={curso}
            errores={editor.errores}
            onCambiarGrado={cambiarGrado}
            onEditar={editor.editarCurso}
          />

          <Card title="Unidades" headingLevel={3} className="bc-editor">
            <ul className="bc-editor__lista">
              {curso.unidades.map((u, i) => (
                <li key={u.id} className="bc-editor__fila">
                  <Button
                    variant={u.id === unidadSel ? 'primary' : 'ghost'}
                    aria-pressed={u.id === unidadSel}
                    onClick={() => {
                      setUnidadSel(u.id);
                      setLeccionSel(null);
                      setEjercicioSel(null);
                    }}
                  >
                    {u.titulo.trim() === '' ? `Unidad ${i + 1} (sin título)` : u.titulo}
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Subir unidad ${i + 1}`}
                    disabled={i === 0}
                    onClick={() => editor.moverUnidad(u.id, 'subir')}
                  >
                    Subir
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Bajar unidad ${i + 1}`}
                    disabled={i === curso.unidades.length - 1}
                    onClick={() => editor.moverUnidad(u.id, 'bajar')}
                  >
                    Bajar
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Eliminar unidad ${i + 1}`}
                    onClick={() => {
                      editor.eliminarUnidad(u.id);
                      if (unidadSel === u.id) {
                        limpiarSeleccion();
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              onClick={() => {
                const id = editor.anadirUnidad();
                setUnidadSel(id);
                setLeccionSel(null);
                setEjercicioSel(null);
              }}
            >
              Añadir unidad
            </Button>
          </Card>

          {unidad ? (
            <>
              <UnidadForm
                unidad={unidad}
                errores={erroresUnidad(unidad)}
                onEditar={(campos) => editor.editarUnidad(unidad.id, campos)}
              />

              <Card title="Lecciones de la unidad" headingLevel={3} className="bc-editor">
                <ul className="bc-editor__lista">
                  {unidad.lecciones.map((l, i) => (
                    <li key={l.id} className="bc-editor__fila">
                      <Button
                        variant={l.id === leccionSel ? 'primary' : 'ghost'}
                        aria-pressed={l.id === leccionSel}
                        onClick={() => {
                          setLeccionSel(l.id);
                          setEjercicioSel(null);
                        }}
                      >
                        {l.titulo.trim() === '' ? `Lección ${i + 1} (sin título)` : l.titulo}
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label={`Subir lección ${i + 1}`}
                        disabled={i === 0}
                        onClick={() => editor.moverLeccion(unidad.id, l.id, 'subir')}
                      >
                        Subir
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label={`Bajar lección ${i + 1}`}
                        disabled={i === unidad.lecciones.length - 1}
                        onClick={() => editor.moverLeccion(unidad.id, l.id, 'bajar')}
                      >
                        Bajar
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label={`Eliminar lección ${i + 1}`}
                        onClick={() => {
                          editor.eliminarLeccion(unidad.id, l.id);
                          if (leccionSel === l.id) {
                            setLeccionSel(null);
                            setEjercicioSel(null);
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const id = editor.anadirLeccion(unidad.id);
                    setLeccionSel(id);
                    setEjercicioSel(null);
                  }}
                >
                  Añadir lección
                </Button>
              </Card>
            </>
          ) : null}

          {unidad && leccion ? (
            <>
              <LeccionForm
                leccion={leccion}
                errores={erroresLeccion(leccion)}
                onEditar={(campos) => editor.editarLeccion(unidad.id, leccion.id, campos)}
              />

              <Card title="Ejercicios de la lección" headingLevel={3} className="bc-editor">
                <ul className="bc-editor__lista">
                  {leccion.ejercicios.map((e, i) => (
                    <li key={e.id} className="bc-editor__fila">
                      <Button
                        variant={e.id === ejercicioSel ? 'primary' : 'ghost'}
                        aria-pressed={e.id === ejercicioSel}
                        onClick={() => setEjercicioSel(e.id)}
                      >
                        {e.enunciado.trim() === ''
                          ? `Ejercicio ${i + 1} (sin enunciado)`
                          : e.enunciado}
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label={`Subir ejercicio ${i + 1}`}
                        disabled={i === 0}
                        onClick={() => editor.moverEjercicio(unidad.id, leccion.id, e.id, 'subir')}
                      >
                        Subir
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label={`Bajar ejercicio ${i + 1}`}
                        disabled={i === leccion.ejercicios.length - 1}
                        onClick={() => editor.moverEjercicio(unidad.id, leccion.id, e.id, 'bajar')}
                      >
                        Bajar
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label={`Eliminar ejercicio ${i + 1}`}
                        onClick={() => {
                          editor.eliminarEjercicio(unidad.id, leccion.id, e.id);
                          if (ejercicioSel === e.id) {
                            setEjercicioSel(null);
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const id = editor.anadirEjercicio(unidad.id, leccion.id);
                    setEjercicioSel(id);
                  }}
                >
                  Añadir ejercicio
                </Button>
              </Card>
            </>
          ) : null}

          {unidad && leccion && ejercicio ? (
            <div className="bc-editor__ejercicio">
              <EjercicioForm
                ejercicio={ejercicio}
                errores={erroresEjercicio(ejercicio)}
                onChange={(actualizado: Ejercicio) =>
                  editor.editarEjercicio(unidad.id, leccion.id, ejercicio.id, actualizado)
                }
              />
              <PreviewEjercicio ejercicio={ejercicio} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
