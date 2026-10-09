import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card } from '../../components';
import { getEjercicioPorId, type Curso, type Ejercicio, type Leccion } from '../../content';
import { Mascota, getMomento } from '../mascota';
import {
  obtenerEjerciciosDue,
  registrarAciertoRepaso,
  registrarFalloRepaso,
  registrarRepasoCompletado,
} from '../progress';
import LeccionDetalle from './LeccionDetalle';

/**
 * Lección de REPASO (tarea 11, R14.2). Contenedor que arma una `Leccion`
 * SINTÉTICA en memoria a partir de los ejercicios "due" del estudiante y la
 * presenta reutilizando el MISMO flujo/renderizadores de la lección normal
 * (`LeccionDetalle`). Funciona 100% offline: los ids due salen de IndexedDB
 * (vía `src/features/progress`) y los ejercicios del contenido empaquetado en
 * memoria (`getEjercicioPorId`). No reimplementa el evaluador ni los
 * renderizadores.
 *
 * Espaciado (R14.3):
 * - Al fallar un ejercicio en el repaso → `registrarFalloRepaso` (mantiene/
 *   acerca) y se marca el id como "fallado en la sesión".
 * - Al COMPLETAR, cada ejercicio due que NO fue fallado en la sesión se
 *   considera ACERTADO → `registrarAciertoRepaso` (espacia o domina). El flujo
 *   obliga a acertar los evaluables para completar, así que "due completado y no
 *   fallado" ⇔ "acertado".
 * - La XP de repaso (+5) se aplica con `registrarRepasoCompletado` (D3), no con
 *   el enganche de XP de lección normal.
 *
 * Accesibilidad: hereda la de `LeccionDetalle` (roles/ARIA, teclado, feedback por
 * ícono + texto, objetivos ≥44px, `prefers-reduced-motion`). La mascota aporta
 * microcopy de marca motivador, nunca de castigo.
 *
 * Privacidad (Ley 1581): todo se asocia a `estudianteId` interno; sin PII.
 *
 * `default export` para permitir `React.lazy` desde la ruta (code-splitting).
 */

export interface RepasoLeccionProps {
  estudianteId: string;
  curso: Curso;
  onVolver: () => void;
  /** Aviso opcional al completar el repaso (para refrescar la ruta). */
  onRepasoCompletado?: () => void;
}

type EstadoCarga =
  | { fase: 'cargando' }
  | { fase: 'vacio' }
  | { fase: 'listo'; leccion: Leccion; dueIds: string[] };

/** Construye la `Leccion` sintética de repaso a partir de los ejercicios due. */
function construirLeccionRepaso(ejercicios: Ejercicio[]): Leccion {
  return {
    id: 'repaso',
    titulo: 'Repaso de errores',
    objetivoAprendizaje: 'Afianzar lo que se te complicó para fijarlo mejor.',
    competencia: 'Repaso y autorregulación del aprendizaje',
    orden: 0,
    ejercicios,
  };
}

export default function RepasoLeccion({
  estudianteId,
  curso,
  onVolver,
  onRepasoCompletado,
}: RepasoLeccionProps) {
  const [estado, setEstado] = useState<EstadoCarga>({ fase: 'cargando' });
  // Ids due resueltos para esta sesión y los fallados durante ella (R14.3).
  const dueIdsRef = useRef<string[]>([]);
  const falladosSesion = useRef<Set<string>>(new Set());
  const completadoRef = useRef(false);

  // Monta la lección sintética una sola vez por sesión de repaso.
  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const dueIds = await obtenerEjerciciosDue(estudianteId);
        const ejercicios = dueIds
          .map((id) => getEjercicioPorId(curso, id))
          .filter((e): e is Ejercicio => e !== undefined);
        if (!activo) {
          return;
        }
        if (ejercicios.length === 0) {
          setEstado({ fase: 'vacio' });
          return;
        }
        dueIdsRef.current = ejercicios.map((e) => e.id);
        setEstado({
          fase: 'listo',
          leccion: construirLeccionRepaso(ejercicios),
          dueIds: dueIdsRef.current,
        });
      } catch {
        if (activo) {
          // Sin acceso al repaso: estado amable, no se bloquea al estudiante.
          setEstado({ fase: 'vacio' });
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, [estudianteId, curso]);

  // R14.3: fallar de nuevo en repaso mantiene/acerca y marca el id en la sesión.
  const alFallarEnRepaso = useCallback(
    (ejercicioId: string) => {
      falladosSesion.current.add(ejercicioId);
      void registrarFalloRepaso(estudianteId, ejercicioId);
    },
    [estudianteId],
  );

  // Al completar: espacia los acertados, aplica la XP de repaso (+5) y vuelve.
  const alCompletado = useCallback(() => {
    if (completadoRef.current) {
      return;
    }
    completadoRef.current = true;
    void (async () => {
      try {
        const acertados = dueIdsRef.current.filter(
          (id) => !falladosSesion.current.has(id),
        );
        await Promise.all(
          acertados.map((id) => registrarAciertoRepaso(estudianteId, id)),
        );
        await registrarRepasoCompletado({ estudianteId });
      } finally {
        onRepasoCompletado?.();
      }
    })();
  }, [estudianteId, onRepasoCompletado]);

  if (estado.fase === 'cargando') {
    return (
      <main className="bc-leccion-flujo" aria-busy="true">
        <p>Preparando tu repaso…</p>
      </main>
    );
  }

  if (estado.fase === 'vacio') {
    const momento = getMomento('acierto');
    return (
      <main className="bc-leccion-flujo">
        <Card title="¡Nada por repasar!" className="bc-leccion-flujo__card">
          <Mascota
            pose={momento.pose}
            size="lg"
            message="¡Vas al día! No tienes errores por repasar."
          />
          <p className="bc-leccion-flujo__cierre">
            Sigue explorando la ruta. Cuando algo se te complique, lo verás aquí
            para afianzarlo.
          </p>
          <Button variant="primary" onClick={onVolver}>
            Volver a la ruta
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <LeccionDetalle
      leccion={estado.leccion}
      estudianteId={estudianteId}
      onVolver={onVolver}
      onCompletada={alCompletado}
      onEjercicioFallado={alFallarEnRepaso}
    />
  );
}
