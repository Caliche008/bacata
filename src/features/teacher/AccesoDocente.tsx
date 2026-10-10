import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button, Card, Feedback } from '../../components';
import { Mascota, getMomento } from '../mascota';
import {
  MENSAJE_PIN_INCORRECTO,
  configurarPin,
  ingresarConPin,
  necesitaConfigurarPin,
} from './teacher-access';
import './teacher.css';

export interface AccesoDocenteProps {
  /** Se invoca cuando el docente queda autenticado (sesión abierta). */
  onEntrar: () => void;
}

/**
 * Pantalla de acceso del docente (R6.5, R8.6). En el primer uso del dispositivo
 * pide crear un PIN; después, ingresarlo. El PIN se guarda solo como hash.
 *
 * Accesibilidad (R9): label asociada (htmlFor/id), `aria-invalid` +
 * `aria-describedby`, error anunciado por `Feedback` (role=status), foco al
 * campo con error, botón y campo con objetivo táctil >= 44px (CSS).
 *
 * Modo local: el panel funciona por dispositivo; en Fase 2 habrá cuentas reales.
 */
export function AccesoDocente({ onEntrar }: AccesoDocenteProps) {
  const bienvenida = getMomento('bienvenida');
  // El primer uso (sin PIN configurado) se decide al montar: la configuración o
  // el ingreso no cambian esta pantalla (al autenticar se invoca `onEntrar`).
  const [primerUso] = useState(() => necesitaConfigurarPin());
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const pinId = useId();
  const errorId = useId();
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) {
      pinRef.current?.focus();
    }
  }, [error]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setEnviando(true);

    void (async () => {
      try {
        if (primerUso) {
          await configurarPin(pin);
          onEntrar();
        } else {
          const ok = await ingresarConPin(pin);
          if (ok) {
            onEntrar();
          } else {
            setError(MENSAJE_PIN_INCORRECTO);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No pudimos validar el PIN.');
      } finally {
        setEnviando(false);
      }
    })();
  };

  const titulo = primerUso ? 'Crea tu PIN de docente' : 'Ingresa tu PIN de docente';
  const ayuda = primerUso
    ? 'Elige un PIN de 4 a 8 dígitos. Lo usarás para entrar al panel en este dispositivo.'
    : 'Escribe el PIN que creaste en este dispositivo.';

  return (
    <main className="bc-teacher">
      <Card title={titulo} className="bc-teacher__section">
        <div className="bc-teacher__hero">
          <Mascota pose={bienvenida.pose} message="Panel del docente" size="md" animated />
        </div>

        <p className="bc-teacher__nota" role="note">
          El panel funciona en este dispositivo. En una próxima versión habrá cuentas
          de docente con recuperación por correo.
        </p>

        <form className="bc-teacher__form" onSubmit={handleSubmit} noValidate>
          <div className="bc-teacher__field">
            <label htmlFor={pinId} className="bc-teacher__label">
              PIN de docente
            </label>
            <p id={`${pinId}-ayuda`} className="bc-teacher__nota">
              {ayuda}
            </p>
            <input
              id={pinId}
              ref={pinRef}
              className="bc-teacher__input"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              maxLength={8}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${pinId}-ayuda ${errorId}` : `${pinId}-ayuda`}
              disabled={enviando}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) {
                  setError(null);
                }
              }}
            />
            {error ? (
              <div id={errorId}>
                <Feedback state="incorrecto" message={error} />
              </div>
            ) : null}
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={enviando}>
            {enviando ? 'Validando…' : primerUso ? 'Crear PIN y entrar' : 'Entrar al panel'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
