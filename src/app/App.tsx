import { AccesoEstudiante, SessionProvider, useSession } from '../features/auth';
import { Bienvenida } from './Bienvenida';

/**
 * Gate de sesión del MVP (tarea 7).
 *
 * - Sin sesión → pantalla de acceso del estudiante (`AccesoEstudiante`).
 * - Con sesión → placeholder mínimo de bienvenida (`Bienvenida`).
 *
 * La ruta de aprendizaje real (unidades, lecciones) llega en tareas 8+ con
 * enrutamiento; aquí el gate es un condicional simple (sin React Router aún).
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

  return perfil ? <Bienvenida /> : <AccesoEstudiante />;
}

function App() {
  return (
    <SessionProvider>
      <Gate />
    </SessionProvider>
  );
}

export default App;
