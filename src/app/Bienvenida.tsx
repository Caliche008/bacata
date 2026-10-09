import { Button, Card } from '../components';
import { Mascota, getMomento } from '../features/mascota';
import { useSession } from '../features/auth';
import './bienvenida.css';

/**
 * Placeholder mínimo tras iniciar sesión (tarea 7). NO construye la ruta de
 * aprendizaje ni las lecciones (eso es tarea 8+): solo saluda al estudiante con
 * la mascota y ofrece cambiar de perfil / cerrar sesión.
 *
 * - "Cambiar de perfil" y "Cerrar sesión" limpian la sesión activa (R1.4); el
 *   perfil permanece en el dispositivo para reentrar sin re-pedir el código.
 */
export function Bienvenida() {
  const { perfil, cerrarSesion } = useSession();
  const bienvenida = getMomento('bienvenida');

  if (!perfil) {
    return null;
  }

  return (
    <main className="bc-bienvenida">
      <Card title={`¡Hola, ${perfil.apodo}!`} className="bc-bienvenida__card">
        <div className="bc-bienvenida__hero">
          <Mascota
            pose={bienvenida.pose}
            message="Qué bueno verte. Pronto empezaremos a explorar la historia."
            size="lg"
            animated
          />
        </div>
        <p className="bc-bienvenida__meta">Grado {perfil.grado}°</p>
        <p className="bc-bienvenida__nota" role="note">
          Tu progreso se guarda solo en este dispositivo.
        </p>
        <div className="bc-bienvenida__acciones">
          <Button variant="secondary" onClick={cerrarSesion}>
            Cambiar de perfil
          </Button>
          <Button variant="ghost" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      </Card>
    </main>
  );
}
