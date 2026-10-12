import { Suspense, lazy, useState } from 'react';
import { AccesoEstudiante, SessionProvider, useSession } from '../features/auth';
import { RutaAprendizaje } from '../features/lessons';
import { ConnectionStatus } from '../components';
import { SplashCarga } from './SplashCarga';
import { useSplashMinimo } from './useSplashMinimo';

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
  // Mínimo de visibilidad del splash de arranque (2.3 s): aunque la sesión
  // resuelva al instante, el splash de marca se mantiene hasta cumplir ese
  // tiempo para que no "pase demasiado rápido".
  const splashCumplido = useSplashMinimo();
  const [vista, setVista] = useState<'estudiante' | 'docente'>('estudiante');
  // La política de privacidad es un overlay accesible desde el acceso del
  // estudiante, la ruta de aprendizaje y el panel docente (R8.4). Se gestiona
  // con estado (sin React Router), igual que la entrada del docente.
  const [verPrivacidad, setVerPrivacidad] = useState(false);

  if (cargando || !splashCumplido) {
    // Splash de marca (mascota + "Bacatá" + "Aprende jugando") en vez de texto
    // suelto. Se muestra mientras se recupera la sesión desde almacenamiento Y
    // hasta cumplir el mínimo de 2.3 s de arranque: se oculta SOLO cuando ambas
    // condiciones se cumplen (sesión resuelta y tiempo mínimo cumplido).
    return <SplashCarga />;
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
       * Aviso de conexión (tarea 12): usa `aria-live` (no roba el foco) y solo
       * aparece sin conexión (R5.7). El aviso de cuota/almacenamiento se retiró
       * del MVP: el contenido es liviano y la app persiste siempre en el
       * dispositivo, así que el aviso resultaba en falsos positivos sin aportar.
       */}
      <ConnectionStatus />
      <Gate />
    </SessionProvider>
  );
}

export default App;
