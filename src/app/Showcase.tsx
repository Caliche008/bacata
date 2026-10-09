import { Button, Card, Feedback, ProgressBar } from '../components';
import { Mascota, MOMENTOS_DISPONIBLES, getMomento } from '../features/mascota';
import { AppearanceControls } from './AppearanceControls';
import './showcase.css';

/**
 * Showcase interno de la base de UI (tarea 6). Demuestra tema, tamaño de texto,
 * componentes base y las poses de la mascota con su microcopy. No implementa
 * features reales (auth, lecciones): eso es tarea 7+.
 */
export function Showcase() {
  return (
    <main className="bc-showcase">
      <header className="bc-showcase__header">
        <h1>Bacatá</h1>
        <p className="bc-showcase__slogan">
          Conoce tu historia, construye tu país.
        </p>
      </header>

      {/* La mascota saluda con protagonismo en la bienvenida. */}
      <Card title="Tu compañero de ruta">
        <div className="bc-showcase__row">
          <Mascota
            pose={getMomento('bienvenida').pose}
            message={getMomento('bienvenida').mensaje}
            size="lg"
            animated
          />
        </div>
      </Card>

      <Card title="Apariencia">
        <AppearanceControls />
      </Card>

      <Card title="Botones">
        <div className="bc-showcase__row">
          <Button variant="primary">Empezar</Button>
          <Button variant="secondary">Repasar</Button>
          <Button variant="ghost">Más tarde</Button>
          <Button variant="primary" disabled>
            Bloqueado
          </Button>
        </div>
      </Card>

      <Card title="Progreso">
        <div className="bc-showcase__stack">
          <ProgressBar label="Unidad: Convivencia" value={40} />
          <ProgressBar label="Eje de la Cátedra de la Paz" value={65} />
        </div>
      </Card>

      <Card title="Retroalimentación">
        <div className="bc-showcase__stack">
          <Feedback state="correcto" message="¡Muy bien! Así se razona." />
          <Feedback
            state="incorrecto"
            message="Casi. Mira esta pista y vuelve a intentarlo."
            hint="Piensa en quién cuenta esta historia."
          />
          <Feedback
            state="info"
            message="Entender el pasado nos ayuda a convivir mejor hoy."
          />
        </div>
      </Card>

      <Card title="La mascota en cada momento">
        <div className="bc-showcase__moments">
          {MOMENTOS_DISPONIBLES.map((momento) => {
            const { pose, mensaje } = getMomento(momento);
            return (
              <div key={momento} className="bc-showcase__moment">
                <Mascota pose={pose} message={mensaje} size="md" />
              </div>
            );
          })}
        </div>
      </Card>
    </main>
  );
}
