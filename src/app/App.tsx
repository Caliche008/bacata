import { Suspense, lazy, useState } from 'react';
import { AccesoEstudiante, SessionProvider, useSession } from '../features/auth';
import { RutaAprendizaje } from '../features/lessons';
import { ConnectionStatus } from '../components';
import { StoragePersistenceNotice } from './StoragePersistenceNotice';

/**
 * Panel docente cargado de forma perezosa (R10.1): su chunk solo se descarga
 * cuando un docente entra, para no penalizar el arranque del estudiante.
 */
const PanelDocente = lazy(() => import('../features/teacher'));

/**
 * Política de privacidad cargada de forma perezosa (R8.4): el texto legal solo
 * se descarga cuando se abre "Privacidad", sin pesar en el arranque.
 */
const PoliticaPrivacidad = lazy(() =>
  import('../features/privacy').then((m) => ({ default: m.PoliticaPrivacidad })),
);

/**
 * Gate de sesión del MVP.
 *
 * - Sin sesión → pantalla de acceso del estudiante (`AccesoEstudiante`), con un
 *   enlace "Soy docente" que abre el panel docente (chunk lazy, separado).
 * - Con sesión → ruta de aprendizaje por niveles (`RutaAprendizaje`, tarea 8),
 *   que incluye su propia cabecera con el saludo y "Cambiar de perfil".
 *
 * El gate es un condicional simple (sin React Router): la navegación interna de
 * la ruta (abrir una lección) la gestiona la propia feature con un estado de
 * vista + `React.lazy`.
 */
function Gate() {
  const { perfil, cargando } = useSession();
  const [vista, setVista] = useState<'estudiante' | 'docente'>('estudiante');
  // La política de privacidad es un overlay accesible desde el acceso del
  // estudiante, la ruta de aprendizaje y el panel docente (R8.4). Se gestiona
  // con estado (sin React Router), igual que la entrada del docente.
  const [verPrivacidad, setVerPrivacidad] = useState(false);

  if (cargando) {
    // Estado breve mientras se recupera la sesión desde almacenamiento.
    return (
      <main className="bc-cargando" aria-busy="true">
        <p>Cargando…</p>
      </main>
    );
  }

  // La política se superpone a cualquier vista. Incluye el borrado de datos del
  // propio estudiante (R8.3) cuando hay sesión activa (`BorrarMisDatos` no
  // renderiza nada sin perfil).
  if (verPrivacidad) {
    return (
      <Suspense
        fallback={
          <main className="bc-cargando" aria-busy="true">
            <p>Cargando…</p>
          </main>
        }
      >
        <PoliticaPrivacidad onCerrar={() => setVerPrivacidad(false)} />
      </Suspense>
    );
  }

  // El panel docente tiene entrada SEPARADA del estudiante y solo se monta
  // cuando el estudiante no tiene sesión y pulsa "Soy docente".
  if (!perfil && vista === 'docente') {
    return (
      <Suspense
        fallback={
          <main className="bc-cargando" aria-busy="true">
            <p>Cargando el panel…</p>
          </main>
        }
      >
        <PanelDocente
          onSalir={() => setVista('estudiante')}
          onVerPrivacidad={() => setVerPrivacidad(true)}
        />
      </Suspense>
    );
  }

  return perfil ? (
    <RutaAprendizaje onVerPrivacidad={() => setVerPrivacidad(true)} />
  ) : (
    <AccesoEstudiante
      onSoyDocente={() => setVista('docente')}
      onVerPrivacidad={() => setVerPrivacidad(true)}
    />
  );
}

function App() {
  return (
    <SessionProvider>
      {/*
       * Avisos de PWA (tarea 12), visibles con y sin sesión. Usan `aria-live`
       * (no roban el foco) y solo se renderizan cuando aplican: sin conexión
       * (R5.7) o poco espacio/persistencia denegada (R5.6).
       */}
      <ConnectionStatus />
      <StoragePersistenceNotice />
      <Gate />
    </SessionProvider>
  );
}

export default App;
