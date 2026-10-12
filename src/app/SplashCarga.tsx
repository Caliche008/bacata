import { Mascota } from '../features/mascota';
import './splash-carga.css';

/**
 * Splash de marca de Bacatá: pantalla de carga que se muestra durante el
 * arranque (mientras se recupera la sesión del almacenamiento local y mientras
 * se resuelve el chunk inicial). Reemplaza el texto suelto "Cargando…" por una
 * bienvenida con la mascota, el nombre "Bacatá" y el lema "Aprende jugando".
 *
 * - Offline y liviano: la mascota es un asset local (PNG en `public/mascota/`);
 *   no se carga nada de red.
 * - Accesibilidad: el contenedor es un `role="status"` con `aria-busy` y una
 *   etiqueta "Cargando Bacatá" para que el lector de pantalla anuncie el estado
 *   de carga. La mascota es decorativa (su significado viaja en el texto). La
 *   animación del "bob" ya respeta `prefers-reduced-motion` (ver mascota.css).
 */
export function SplashCarga({ className }: { className?: string }) {
  const wrapperClasses = ['bc-splash', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <main
      className={wrapperClasses}
      role="status"
      aria-busy="true"
      aria-label="Cargando Bacatá"
    >
      <Mascota pose="saludando" size="lg" animated />
      <p className="bc-splash__marca">Bacatá</p>
      <p className="bc-splash__tagline">Aprende jugando</p>
    </main>
  );
}
