import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from '../../components';
import { getLeccion, getUnidad, type Leccion } from '../../content';
import { getClassByCode, getProgressByStudent } from '../../lib/storage';
import { useSession } from '../auth';
import { Mascota } from '../mascota';
import {
  CabeceraGamificacion,
  PanelProgreso,
  LOGROS,
  PREFIJO_UNIDAD_COMPLETADA,
  contarDue,
  registrarFallo,
  useGamificacion,
} from '../progress';
import type { ResumenLeccion } from './answers';
import { CelebracionUnidad } from './CelebracionUnidad';
import { ContenidoNoDisponible } from './ContenidoNoDisponible';
import { LeccionErrorBoundary } from './LeccionErrorBoundary';
import { UnidadCard } from './UnidadCard';
import { useRuta } from './useRuta';
import { construirRuta, type UnidadVista } from './path';
import './lessons.css';

/**
 * Contenedor de la ruta de aprendizaje (tarea 8). Reemplaza el placeholder de
 * bienvenida: muestra las unidades del grado del estudiante en orden, con su
 * progreso y el estado de cada lección. Tocar una lección DISPONIBLE abre el
 * flujo de lección (tarea 9).
 *
 * Navegación: en vez de añadir React Router (no instalado) solo para abrir un
 * detalle, se usa un estado de vista simple (`'ruta' | { leccionId }`). La vista
 * de lección se carga con `React.lazy` para habilitar code-splitting (R10.1).
 *
 * Celebración (R2.7/R15.1): se expone el enganche conceptual "unidad completada"
 * comparando el conjunto de unidades completadas entre renders; cuando una
 * unidad pasa a completada, se dispara la celebración con la mascota.
 *
 * Gamificación (tarea 10.3): monta la cabecera de XP/racha, engancha
 * `onLeccionCompletada` en `LeccionDetalle` para registrar la gamificación al
 * completar una lección (vía `useGamificacion`), y ofrece un acceso a
 * "Mi progreso". La celebración se refuerza con la XP/racha/logros recién
 * obtenidos. No cambia la firma de `LeccionDetalle` ni la lógica del evaluador.
 */

const LeccionDetalle = lazy(() => import('./LeccionDetalle'));
const RepasoLeccion = lazy(() => import('./RepasoLeccion'));

type Vista =
  | { tipo: 'ruta' }
  | { tipo: 'leccion'; leccionId: string }
  | { tipo: 'repaso' };

interface CelebracionData {
  tituloUnidad: string;
  xpGanada?: number;
  rachaActual?: number;
  logrosNuevos?: string[];
}

function idsUnidadesCompletadas(unidades: UnidadVista[]): Set<string> {
  return new Set(unidades.filter((unidad) => unidad.completada).map((unidad) => unidad.id));
}

/**
 * Resuelve el título de un logro para la celebración. Un logro fijo (p. ej. la
 * racha de 7 días) sale del catálogo `LOGROS`; un logro de unidad usa el título
 * de la unidad ya disponible en la ruta.
 */
function tituloLogro(id: string, titulosUnidad: Map<string, string>): string {
  const fijo = LOGROS.find((logro) => logro.id === id);
  if (fijo) {
    return fijo.titulo;
  }
  if (id.startsWith(PREFIJO_UNIDAD_COMPLETADA)) {
    const unidadId = id.slice(PREFIJO_UNIDAD_COMPLETADA.length);
    const titulo = titulosUnidad.get(unidadId);
    if (titulo) {
      return `¡Completaste "${titulo}"!`;
    }
  }
  return 'Nuevo logro';
}

export function RutaAprendizaje() {
  const { perfil, cerrarSesion } = useSession();
  const { cargando, error, curso, ruta, recargar } = useRuta();
  const [vista, setVista] = useState<Vista>({ tipo: 'ruta' });
  const [celebracion, setCelebracion] = useState<CelebracionData | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  // Repaso de errores (R14.2): nº de ejercicios "due". La entrada solo aparece
  // cuando hay > 0.
  const [cantidadDue, setCantidadDue] = useState(0);

  const gamificacion = useGamificacion(perfil?.id, curso);

  // Recalcula los ejercicios "due" del repaso (R14.2). Se invoca al montar, al
  // volver del repaso y tras completar una lección (que puede añadir fallos).
  const refrescarDue = useCallback(async () => {
    if (!perfil) {
      return;
    }
    try {
      setCantidadDue(await contarDue(perfil.id));
    } catch {
      // El repaso es un refuerzo: si no se puede leer, no se muestra la entrada.
      setCantidadDue(0);
    }
  }, [perfil]);

  useEffect(() => {
    void refrescarDue();
  }, [refrescarDue]);

  // Datos de la última gamificación registrada, para enriquecer la celebración
  // cuando la unidad recién completada coincida con la lección registrada.
  const ultimaGamificacion = useRef<{ xpGanada: number; rachaActual: number } | null>(null);

  // Enganche de celebración: detecta unidades recién completadas comparando el
  // estado previo con el nuevo tras cada cambio de progreso/ruta.
  const completadasPrevias = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!ruta) {
      return;
    }
    const completadasAhora = idsUnidadesCompletadas(ruta.unidades);
    const previas = completadasPrevias.current;
    if (previas) {
      const nueva = ruta.unidades.find(
        (unidad) => unidad.completada && !previas.has(unidad.id),
      );
      if (nueva) {
        const titulosUnidad = new Map(ruta.unidades.map((u) => [u.id, u.titulo]));
        const logroUnidadId = `${PREFIJO_UNIDAD_COMPLETADA}${nueva.id}`;
        const logrosNuevos = gamificacion.logrosNuevos.map((id) =>
          tituloLogro(id, titulosUnidad),
        );
        const incluyeUnidad = gamificacion.logrosNuevos.includes(logroUnidadId);
        const extra = ultimaGamificacion.current;
        setCelebracion({
          tituloUnidad: nueva.titulo,
          xpGanada: extra?.xpGanada,
          rachaActual: extra?.rachaActual,
          logrosNuevos: incluyeUnidad ? logrosNuevos : undefined,
        });
      }
    }
    completadasPrevias.current = completadasAhora;
  }, [ruta, gamificacion.logrosNuevos]);

  // Busca la lección seleccionada en el curso para abrir su detalle.
  const leccionSeleccionada = useMemo<Leccion | null>(() => {
    if (vista.tipo !== 'leccion' || !curso) {
      return null;
    }
    for (const unidad of curso.unidades) {
      const unidadCompleta = getUnidad(curso, unidad.id);
      const leccion = unidadCompleta ? getLeccion(unidadCompleta, vista.leccionId) : undefined;
      if (leccion) {
        return leccion;
      }
    }
    return null;
  }, [vista, curso]);

  // Enganche de gamificación: tras completar una lección, re-deriva el progreso
  // real desde el store, calcula las unidades 100 % completadas (vía `path.ts`)
  // y registra la gamificación. Se ejecuta una sola vez por lección completada.
  const alCompletarLeccion = useCallback(
    async (resumen: ResumenLeccion) => {
      if (!perfil || !curso) {
        return;
      }
      try {
        const [progreso, clase] = await Promise.all([
          getProgressByStudent(perfil.id),
          getClassByCode(perfil.codigoClase),
        ]);
        const activas =
          clase && clase.unidadesActivas.length > 0 ? clase.unidadesActivas : null;
        const rutaActual = construirRuta(curso, activas, progreso);
        const unidadesCompletadas = rutaActual.unidades
          .filter((unidad) => unidad.completada)
          .map((unidad) => unidad.id);
        await gamificacion.registrar(resumen, unidadesCompletadas);
      } catch {
        // La gamificación es un refuerzo: si falla, no bloquea el flujo de la
        // lección (el progreso ya quedó persistido por `LeccionDetalle`).
      }
    },
    [perfil, curso, gamificacion],
  );

  // Guarda la XP/racha recién ganadas para enriquecer la celebración de unidad.
  useEffect(() => {
    if (gamificacion.xpUltimaLeccion > 0) {
      ultimaGamificacion.current = {
        xpGanada: gamificacion.xpUltimaLeccion,
        rachaActual: gamificacion.rachaActual,
      };
    }
  }, [gamificacion.xpUltimaLeccion, gamificacion.rachaActual]);

  if (!perfil) {
    return null;
  }

  if (vista.tipo === 'leccion' && leccionSeleccionada) {
    return (
      // El boundary se reinicia por lección (`key`): si una lección crashea,
      // abrir otra parte desde cero en vez de arrastrar el estado de error.
      <LeccionErrorBoundary key={vista.leccionId} onVolver={() => setVista({ tipo: 'ruta' })}>
        <Suspense
          fallback={
            <main className="bc-ruta__cargando" aria-busy="true">
              <p>Cargando…</p>
            </main>
          }
        >
          <LeccionDetalle
            leccion={leccionSeleccionada}
            estudianteId={perfil.id}
            onVolver={() => setVista({ tipo: 'ruta' })}
            onCompletada={() => {
              recargar();
              void refrescarDue();
            }}
            onLeccionCompletada={alCompletarLeccion}
            onEjercicioFallado={(ejercicioId) => {
              // R14.1: un fallo en lección normal entra al repaso de errores.
              void registrarFallo(perfil.id, ejercicioId);
            }}
          />
        </Suspense>
      </LeccionErrorBoundary>
    );
  }

  // R5.7: se pidió una lección que no está en el contenido empaquetado (caso
  // límite del MVP; en Fase 2, contenido aún no descargado). Avisar de forma
  // accesible en vez de volver en silencio a la ruta.
  if (vista.tipo === 'leccion' && !leccionSeleccionada && !cargando) {
    return <ContenidoNoDisponible onVolver={() => setVista({ tipo: 'ruta' })} />;
  }

  if (vista.tipo === 'repaso' && curso) {
    return (
      <LeccionErrorBoundary
        key="repaso"
        onVolver={() => {
          setVista({ tipo: 'ruta' });
          void refrescarDue();
        }}
      >
        <Suspense
          fallback={
            <main className="bc-ruta__cargando" aria-busy="true">
              <p>Cargando…</p>
            </main>
          }
        >
          <RepasoLeccion
            estudianteId={perfil.id}
            curso={curso}
            onVolver={() => {
              setVista({ tipo: 'ruta' });
              void refrescarDue();
            }}
            onRepasoCompletado={refrescarDue}
          />
        </Suspense>
      </LeccionErrorBoundary>
    );
  }

  return (
    <main className="bc-ruta">
      <header className="bc-ruta__cabecera">
        <div>
          <h1 className="bc-ruta__saludo">¡Hola, {perfil.apodo}!</h1>
          <p className="bc-ruta__meta">Grado {perfil.grado}°</p>
        </div>
        <Button variant="ghost" onClick={cerrarSesion}>
          Cambiar de perfil
        </Button>
      </header>

      <CabeceraGamificacion
        xp={gamificacion.xp}
        rachaActual={gamificacion.rachaActual}
        reinicioReciente={gamificacion.reinicioReciente}
      />

      {curso ? (
        <div className="bc-ruta__acciones">
          <Button variant="secondary" onClick={() => setPanelAbierto(true)}>
            Mi progreso
          </Button>
        </div>
      ) : null}

      {curso && cantidadDue > 0 ? (
        <Card className="bc-ruta__repaso">
          <div className="bc-ruta__repaso-cuerpo">
            <Mascota
              pose="durmiendo"
              size="sm"
              message="Repasemos lo que se te complicó."
            />
            <div className="bc-ruta__repaso-texto">
              <h2 className="bc-ruta__repaso-titulo">Repasa lo que fallaste</h2>
              <p>
                Tienes {cantidadDue}{' '}
                {cantidadDue === 1 ? 'ejercicio' : 'ejercicios'} por repasar. ¡Cinco
                minutos para afianzar lo aprendido!
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => setVista({ tipo: 'repaso' })}
            aria-label={`Repasar ${cantidadDue} ${
              cantidadDue === 1 ? 'ejercicio' : 'ejercicios'
            } que fallaste`}
          >
            Repasar ahora
          </Button>
        </Card>
      ) : null}

      {cargando ? (
        <p className="bc-ruta__cargando" aria-busy="true">
          Cargando tu ruta…
        </p>
      ) : null}

      {error ? (
        <p className="bc-ruta__error" role="alert">
          {error}
        </p>
      ) : null}

      {ruta && !error ? (
        <ol className="bc-ruta__unidades">
          {ruta.unidades.map((unidad) => (
            <li key={unidad.id}>
              <UnidadCard
                unidad={unidad}
                onSelectLeccion={(leccionId) => setVista({ tipo: 'leccion', leccionId })}
              />
            </li>
          ))}
        </ol>
      ) : null}

      {celebracion ? (
        <CelebracionUnidad
          tituloUnidad={celebracion.tituloUnidad}
          xpGanada={celebracion.xpGanada}
          rachaActual={celebracion.rachaActual}
          logrosNuevos={celebracion.logrosNuevos}
          onCerrar={() => setCelebracion(null)}
        />
      ) : null}

      {panelAbierto && curso ? (
        <PanelProgreso
          logros={gamificacion.logros}
          avanceEjePaz={gamificacion.avanceEjePaz}
          curso={curso}
          onCerrar={() => setPanelAbierto(false)}
        />
      ) : null}
    </main>
  );
}
