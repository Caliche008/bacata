import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components';
import { getLeccion, getUnidad, type Leccion } from '../../content';
import { useSession } from '../auth';
import { CelebracionUnidad } from './CelebracionUnidad';
import { UnidadCard } from './UnidadCard';
import { useRuta } from './useRuta';
import type { UnidadVista } from './path';
import './lessons.css';

/**
 * Contenedor de la ruta de aprendizaje (tarea 8). Reemplaza el placeholder de
 * bienvenida: muestra las unidades del grado del estudiante en orden, con su
 * progreso y el estado de cada lección. Tocar una lección DISPONIBLE abre un
 * placeholder de lección (tarea 9 implementará los ejercicios).
 *
 * Navegación: en vez de añadir React Router (no instalado) solo para abrir un
 * detalle, se usa un estado de vista simple (`'ruta' | { leccionId }`). La vista
 * de lección se carga con `React.lazy` para habilitar code-splitting (R10.1).
 *
 * Celebración (R2.7/R15.1): se expone el enganche conceptual "unidad completada"
 * comparando el conjunto de unidades completadas entre renders; cuando una
 * unidad pasa a completada, se dispara la celebración con la mascota.
 */

const LeccionDetalle = lazy(() => import('./LeccionDetalle'));

type Vista = { tipo: 'ruta' } | { tipo: 'leccion'; leccionId: string };

function idsUnidadesCompletadas(unidades: UnidadVista[]): Set<string> {
  return new Set(unidades.filter((unidad) => unidad.completada).map((unidad) => unidad.id));
}

export function RutaAprendizaje() {
  const { perfil, cerrarSesion } = useSession();
  const { cargando, error, curso, ruta } = useRuta();
  const [vista, setVista] = useState<Vista>({ tipo: 'ruta' });
  const [celebracion, setCelebracion] = useState<string | null>(null);

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
        setCelebracion(nueva.titulo);
      }
    }
    completadasPrevias.current = completadasAhora;
  }, [ruta]);

  // Busca la lección seleccionada en el curso para el placeholder de detalle.
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

  if (!perfil) {
    return null;
  }

  if (vista.tipo === 'leccion' && leccionSeleccionada) {
    return (
      <Suspense
        fallback={
          <main className="bc-ruta__cargando" aria-busy="true">
            <p>Cargando…</p>
          </main>
        }
      >
        <LeccionDetalle
          titulo={leccionSeleccionada.titulo}
          objetivoAprendizaje={leccionSeleccionada.objetivoAprendizaje}
          onVolver={() => setVista({ tipo: 'ruta' })}
        />
      </Suspense>
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
        <CelebracionUnidad tituloUnidad={celebracion} onCerrar={() => setCelebracion(null)} />
      ) : null}
    </main>
  );
}
