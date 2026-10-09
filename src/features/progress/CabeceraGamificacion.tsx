import { Mascota, getMomento } from '../mascota';
import './progress.css';

/**
 * Cabecera de gamificación (tarea 10.3, R4.1/R4.2/R4.6): muestra la XP total y
 * la racha actual del estudiante.
 *
 * Accesibilidad:
 * - La información NUNCA se transmite solo por color: cada métrica combina un
 *   ícono (`aria-hidden`, decorativo) + TEXTO visible, y el valor se anuncia con
 *   una etiqueta en español (`aria-label`) para el lector de pantalla.
 * - Los chips cumplen el objetivo táctil mínimo (>= 44px) vía `--touch-min`.
 * - El mensaje de reinicio de racha es MOTIVADOR, nunca de castigo (brand.md):
 *   la mascota (pose de `getMomento('racha')`) acompaña y anima a retomar.
 * - Sin animaciones propias; cualquier animación de la mascota respeta
 *   `prefers-reduced-motion` por el reset global.
 *
 * Sin rankings ni comparaciones entre estudiantes (R4.4). Sin PII.
 */

export interface CabeceraGamificacionProps {
  xp: number;
  rachaActual: number;
  /** `true` si la racha se reinició recién (muestra ánimo, nunca castigo). */
  reinicioReciente?: boolean;
}

export function CabeceraGamificacion({
  xp,
  rachaActual,
  reinicioReciente = false,
}: CabeceraGamificacionProps) {
  const racha = getMomento('racha');
  const diasTexto = rachaActual === 1 ? 'día' : 'días';

  return (
    <section className="bc-gamificacion" aria-label="Tu progreso de gamificación">
      <ul className="bc-gamificacion__metricas">
        <li
          className="bc-gamificacion__chip"
          aria-label={`${xp} puntos de experiencia acumulados`}
        >
          <span className="bc-gamificacion__icono" aria-hidden="true">
            ⭐
          </span>
          <span className="bc-gamificacion__valor">{xp}</span>
          <span>XP</span>
        </li>
        <li
          className="bc-gamificacion__chip"
          aria-label={`Racha actual: ${rachaActual} ${diasTexto} seguidos`}
        >
          <span className="bc-gamificacion__icono" aria-hidden="true">
            🔥
          </span>
          <span className="bc-gamificacion__valor">{rachaActual}</span>
          <span>{diasTexto} de racha</span>
        </li>
      </ul>

      {reinicioReciente ? (
        <div className="bc-gamificacion__reinicio" role="status">
          <span className="bc-gamificacion__reinicio-mascota">
            <Mascota pose={racha.pose} size="sm" decorative />
          </span>
          <span>Volviste a empezar tu racha. Tu constancia cuenta: ¡sigue así!</span>
        </div>
      ) : null}
    </section>
  );
}
