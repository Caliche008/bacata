import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Button, Card, Feedback, ProgressBar } from '../../components';
import type { Leccion } from '../../content';
import type { Progreso } from '../../lib/storage';
import { Mascota, getMomento } from '../mascota';
import { respuestaInicial, type Respuesta, type ResumenLeccion } from './answers';
import { ExerciseRenderer } from './exercises/ExerciseRenderer';
import { AvisoSensible } from './exercises/AvisoSensible';
import { FuenteCredito } from './exercises/FuenteCredito';
import {
  construirResumen,
  estadoInicial,
  evaluarEjercicio,
  reducer,
  type AccionFlujo,
  type EstadoFlujo,
} from './leccion-flow';
import { cargarProgresoLeccion, guardarParcial, marcarCompletada } from './leccion-progreso';

/**
 * Flujo real de lección (tarea 9.3/9.4), reemplaza el placeholder. Orquesta el
 * reducer puro (`leccion-flow`), los renderizadores accesibles y la persistencia
 * (`leccion-progreso`), con la mascota como compañera en cada paso.
 *
 * - Una acción principal por pantalla: Responder → Feedback → Siguiente (R2.4).
 * - Retroalimentación inmediata por TEXTO + ÍCONO (nunca solo color) con
 *   `Feedback` y la mascota: pose feliz en acierto, pose animando en error, sin
 *   burla (R3.2/R3.6/R3.7).
 * - Dilema: muestra la reflexión según la opción, sin marcar correcto/incorrecto
 *   (R3.3).
 * - Fuente/crédito: lo renderiza cada ejercicio que la tenga (R3.8).
 * - Temas sensibles: `AvisoSensible` con nota de contexto y opción de OMITIR, que
 *   no bloquea completar (R12.3/R12.4).
 * - Abandono/retome: al desmontar o volver, guarda `parcial`; al montar,
 *   rehidrata (R3.9), sin penalización.
 * - Completar: cuando todos los evaluables están resueltos, marca la lección en
 *   el store `progreso`, emite el resumen al enganche opcional de XP (tarea 10) y
 *   avisa a la ruta para recargar y disparar la celebración (R3.4).
 *
 * Se mantiene como `default export` para preservar el `React.lazy` de
 * `RutaAprendizaje` (code-splitting, R10.1).
 */

export interface LeccionDetalleProps {
  leccion: Leccion;
  estudianteId: string;
  onVolver: () => void;
  onCompletada: () => void;
  /** Enganche para la tarea 10 (XP/rachas). Aquí NO se implementa lógica de XP. */
  onLeccionCompletada?: (resumen: ResumenLeccion) => void;
  /**
   * Enganche OPCIONAL (tarea 11, R14.1): se invoca con el id del ejercicio la
   * primera vez que se evalúa INCORRECTO en este montaje. El dilema (sin
   * veredicto) nunca lo dispara. Opcional para no romper a los llamadores
   * actuales ni la firma pública.
   */
  onEjercicioFallado?: (ejercicioId: string) => void;
}

export default function LeccionDetalle({
  leccion,
  estudianteId,
  onVolver,
  onCompletada,
  onLeccionCompletada,
  onEjercicioFallado,
}: LeccionDetalleProps) {
  const [estado, dispatch] = useReducer(
    (prev: EstadoFlujo, accion: AccionFlujo) => reducer(leccion, prev, accion),
    leccion,
    (lec) => estadoInicial(lec),
  );

  // Respuesta en curso del ejercicio actual (controlada por el renderizador).
  const ejercicioActual = leccion.ejercicios[estado.indice];
  const [respuesta, setRespuesta] = useState<Respuesta>(() =>
    ejercicioActual
      ? respuestaInicial(ejercicioActual)
      : { tipo: 'opcion_multiple', opcionId: null },
  );

  // Progreso previo del store (para rehidratar y para reusar su id al guardar).
  const progresoPrevio = useRef<Progreso | undefined>(undefined);
  // Índice actual accesible desde el cleanup de desmontaje (abandono, R3.9).
  const indiceRef = useRef(estado.indice);
  indiceRef.current = estado.indice;
  const completadaRef = useRef(false);
  // Ids ya notificados como fallo en este montaje (R14.1): un reintento del mismo
  // ejercicio no infla `fallos` más de una vez por aparición.
  const falladosNotificados = useRef<Set<string>>(new Set());

  // Carga inicial: rehidrata el avance parcial si existe (R3.9).
  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const previo = await cargarProgresoLeccion(estudianteId, leccion.id);
        if (!activo) {
          return;
        }
        progresoPrevio.current = previo;
        if (previo?.estado === 'completada') {
          completadaRef.current = true;
        } else if (typeof previo?.parcial === 'number' && previo.parcial > 0) {
          dispatch({ tipo: 'rehidratar', indice: previo.parcial });
        }
      } catch {
        // Sin progreso previo accesible: se arranca desde el inicio sin penalizar.
      }
    })();
    return () => {
      activo = false;
    };
  }, [estudianteId, leccion.id]);

  // Al cambiar de ejercicio, reinicia la respuesta en curso.
  useEffect(() => {
    if (ejercicioActual) {
      setRespuesta(respuestaInicial(ejercicioActual));
    }
  }, [ejercicioActual]);

  // Guarda el avance parcial al desmontar (abandono a mitad, R3.9).
  useEffect(() => {
    return () => {
      if (completadaRef.current) {
        return;
      }
      void guardarParcial(estudianteId, leccion.id, indiceRef.current, progresoPrevio.current);
    };
  }, [estudianteId, leccion.id]);

  const resultadoActual = ejercicioActual ? estado.resultados[ejercicioActual.id] : undefined;

  const responder = useCallback(() => {
    if (!ejercicioActual) {
      return;
    }
    const resultado = evaluarEjercicio(ejercicioActual, respuesta);
    // R14.1: registrar el fallo una sola vez por aparición. El dilema tiene
    // `correcto === null`, así que nunca entra aquí (sin veredicto, R3.3).
    if (resultado.correcto === false && !falladosNotificados.current.has(ejercicioActual.id)) {
      falladosNotificados.current.add(ejercicioActual.id);
      onEjercicioFallado?.(ejercicioActual.id);
    }
    dispatch({ tipo: 'responder', ejercicioId: ejercicioActual.id, respuesta, resultado });
  }, [ejercicioActual, respuesta, onEjercicioFallado]);

  const reintentar = useCallback(() => {
    if (!ejercicioActual) {
      return;
    }
    setRespuesta(respuestaInicial(ejercicioActual));
    dispatch({ tipo: 'reintentar', ejercicioId: ejercicioActual.id });
  }, [ejercicioActual]);

  // Al llegar a la fase "completada": persistir, emitir resumen y avisar a la ruta.
  useEffect(() => {
    if (estado.fase !== 'completada' || completadaRef.current) {
      return;
    }
    completadaRef.current = true;
    const resumen = construirResumen(leccion, estado);
    void (async () => {
      try {
        await marcarCompletada(estudianteId, leccion.id, resumen.aciertos, progresoPrevio.current);
      } finally {
        onLeccionCompletada?.(resumen);
        onCompletada();
      }
    })();
  }, [estado, leccion, estudianteId, onCompletada, onLeccionCompletada]);

  // Pantalla de cierre con la mascota celebrando mientras la ruta recarga.
  if (estado.fase === 'completada') {
    const acierto = getMomento('acierto');
    return (
      <main className="bc-leccion-flujo">
        <Card title={`¡Terminaste ${leccion.titulo}!`} className="bc-leccion-flujo__card">
          <Mascota pose="celebrando" size="lg" message={acierto.mensaje} animated />
          <p className="bc-leccion-flujo__cierre">
            Entender el pasado nos ayuda a convivir mejor hoy. Sigue así.
          </p>
          <Button variant="primary" onClick={onVolver}>
            Volver a la ruta
          </Button>
        </Card>
      </main>
    );
  }

  if (!ejercicioActual) {
    return null;
  }

  const total = leccion.ejercicios.length;
  const numero = estado.indice + 1;
  const esDilema = ejercicioActual.tipo === 'dilema';
  const enFeedback = estado.fase === 'feedback';
  const correcto = resultadoActual?.correcto === true;
  const incorrecto = resultadoActual?.correcto === false;

  const momentoMascota = correcto ? getMomento('acierto') : getMomento('error');

  return (
    <main className="bc-leccion-flujo">
      <div className="bc-leccion-flujo__cabecera">
        <Button variant="ghost" onClick={onVolver}>
          Volver a la ruta
        </Button>
        <ProgressBar value={numero} max={total} label={`Ejercicio ${numero} de ${total}`} />
      </div>

      <Card className="bc-leccion-flujo__card">
        {estado.fase === 'intro-sensible' && ejercicioActual.meta.notaContexto ? (
          <AvisoSensible
            notaContexto={ejercicioActual.meta.notaContexto}
            onContinuar={() => dispatch({ tipo: 'mostrarEjercicio' })}
            onOmitir={() =>
              dispatch({ tipo: 'omitirSensible', ejercicioId: ejercicioActual.id })
            }
          />
        ) : (
          <>
            <ExerciseRenderer
              ejercicio={ejercicioActual}
              respuesta={respuesta}
              onChange={setRespuesta}
              deshabilitado={enFeedback}
            />

            {/* Crédito de fuente (R3.8). analisis_fuente ya lo muestra junto al
                recurso, así que aquí se evita duplicarlo. */}
            {ejercicioActual.tipo !== 'analisis_fuente' && ejercicioActual.meta.fuente ? (
              <FuenteCredito fuente={ejercicioActual.meta.fuente} />
            ) : null}

            {enFeedback && resultadoActual ? (
              <div className="bc-leccion-flujo__feedback">
                {esDilema ? (
                  <Feedback
                    state="info"
                    message="Para pensar"
                    hint={resultadoActual.retroalimentacion}
                  />
                ) : (
                  <>
                    <Feedback
                      state={correcto ? 'correcto' : 'incorrecto'}
                      message={momentoMascota.mensaje}
                      hint={
                        correcto
                          ? resultadoActual.retroalimentacion
                          : (resultadoActual.hint ?? resultadoActual.retroalimentacion)
                      }
                    />
                    <Mascota
                      pose={momentoMascota.pose}
                      size="sm"
                      message={correcto ? resultadoActual.retroalimentacion : undefined}
                    />
                  </>
                )}
              </div>
            ) : null}

            <div className="bc-leccion-flujo__acciones">
              {!enFeedback ? (
                <Button variant="primary" onClick={responder}>
                  Responder
                </Button>
              ) : null}
              {enFeedback && incorrecto ? (
                <Button variant="secondary" onClick={reintentar}>
                  Reintentar
                </Button>
              ) : null}
              {enFeedback && (correcto || esDilema) ? (
                <Button variant="primary" onClick={() => dispatch({ tipo: 'avanzar' })}>
                  {numero < total ? 'Siguiente' : 'Terminar'}
                </Button>
              ) : null}
            </div>
          </>
        )}
      </Card>
    </main>
  );
}
