import { AccesoEstudiante, SessionProvider, useSession } from '../features/auth';
import { RutaAprendizaje } from '../features/lessons';
import { ConnectionStatus } from '../components';
import { StoragePersistenceNotice } from './StoragePersistenceNotice';

/**
 * Gate de sesión del MVP.
 *
 * - Sin sesión → pantalla de acceso del estudiante (`AccesoEstudiante`).
 * - Con sesión → ruta de aprendizaje por niveles (`RutaAprendizaje`, tarea 8),
 *   que incluye su propia cabecera con el saludo y "Cambiar de perfil".
 *
 * El gate es un condicional simple (sin React Router): la navegación interna de
 * la ruta (abrir una lección) la gestiona la propia feature con un estado de
 * vista + `React.lazy`.
 */
function Gate() {
  const { perfil, cargando } = useSession();

  if (cargando) {
    // Estado breve mientras se recupera la sesión desde almacenamiento.
    return (
      <main className="bc-cargando" aria-busy="true">
        <p>Cargando…</p>
      </main>
    );
  }

  return perfil ? <RutaAprendizaje /> : <AccesoEstudiante />;
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
