import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button, Card, Feedback } from '../../components';
import { Mascota, getMomento } from '../mascota';
import type { Grado } from '../../content/types';
import { useAuthForm } from './useAuthForm';
import './auth.css';

/**
 * Pantalla de acceso del estudiante (R1): código de clase + apodo + grado.
 *
 * Accesibilidad (R9): cada campo tiene <label> asociada (htmlFor/id); los
 * errores se anuncian por `aria-live` (vía Feedback: role="status"), se enlazan
 * con `aria-describedby` y marcan `aria-invalid`; al fallar, el foco va al
 * primer campo con error; el grado usa un `radiogroup` operable por teclado;
 * objetivos táctiles ≥44px vía CSS; el error nunca se transmite solo por color
 * (texto + ícono vía Feedback).
 *
 * Privacidad (R1.2, R1.7, R1.9): solo pide apodo, código y grado; avisa de no
 * usar nombre real y de que el progreso se guarda solo en este dispositivo.
 *
 * Una acción principal por pantalla: el botón "Entrar".
 *
 * `onSoyDocente` (opcional): si se pasa, muestra un enlace discreto "Soy
 * docente" para abrir el panel del docente (entrada SEPARADA del estudiante).
 * `onVerPrivacidad` (opcional): muestra un enlace "Privacidad" para abrir la
 * política (R8.4), sin obligar a leerla. Sin estas props, la pantalla no cambia
 * (preserva el comportamiento previo).
 */
export interface AccesoEstudianteProps {
  onSoyDocente?: () => void;
  onVerPrivacidad?: () => void;
}

export function AccesoEstudiante({
  onSoyDocente,
  onVerPrivacidad,
}: AccesoEstudianteProps = {}) {
  const bienvenida = getMomento('bienvenida');
  const {
    error,
    enviando,
    bloqueado,
    segundosRestantes,
    enviar,
    limpiarError,
  } = useAuthForm();

  const [codigoClase, setCodigoClase] = useState('');
  const [apodo, setApodo] = useState('');
  const [grado, setGrado] = useState<Grado>(6);

  const codigoId = useId();
  const apodoId = useId();
  const codigoErrorId = useId();
  const apodoErrorId = useId();
  const avisoApodoId = useId();
  const gradoLabelId = useId();

  const codigoRef = useRef<HTMLInputElement>(null);
  const apodoRef = useRef<HTMLInputElement>(null);

  // Mueve el foco al primer campo con error para un flujo accesible.
  useEffect(() => {
    if (!error) {
      return;
    }
    if (error.field === 'codigoClase') {
      codigoRef.current?.focus();
    } else if (error.field === 'apodo') {
      apodoRef.current?.focus();
    }
  }, [error]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void enviar({ codigoClase, apodo, grado });
  };

  const codigoError = error?.field === 'codigoClase' ? error.message : null;
  const apodoError = error?.field === 'apodo' ? error.message : null;
  const generalError = error?.field === 'general' ? error.message : null;

  return (
    <main className="bc-auth">
      <Card title="Bienvenido a Bacatá" className="bc-auth__card">
        <div className="bc-auth__hero">
          <Mascota
            pose={bienvenida.pose}
            message={bienvenida.mensaje}
            size="lg"
            animated
          />
        </div>

        {/* Aviso de solo-local (R1.9 MVP), persistente y no bloqueante. */}
        <p className="bc-auth__nota" role="note">
          Tu progreso se guarda solo en este dispositivo.
        </p>

        <form className="bc-auth__form" onSubmit={handleSubmit} noValidate>
          <div className="bc-auth__field">
            <label htmlFor={codigoId} className="bc-auth__label">
              Código de tu clase
            </label>
            <input
              id={codigoId}
              ref={codigoRef}
              className="bc-auth__input"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              value={codigoClase}
              maxLength={8}
              aria-invalid={codigoError ? true : undefined}
              aria-describedby={codigoError ? codigoErrorId : undefined}
              disabled={bloqueado || enviando}
              onChange={(e) => {
                setCodigoClase(e.target.value);
                if (codigoError) {
                  limpiarError();
                }
              }}
            />
            {codigoError ? (
              <div id={codigoErrorId}>
                <Feedback state="incorrecto" message={codigoError} />
              </div>
            ) : null}
          </div>

          <div className="bc-auth__field">
            <label htmlFor={apodoId} className="bc-auth__label">
              Tu apodo
            </label>
            {/* Aviso antes de elegir el apodo (R1.7). */}
            <p id={avisoApodoId} className="bc-auth__ayuda">
              No uses tu nombre real ni datos que te identifiquen.
            </p>
            <input
              id={apodoId}
              ref={apodoRef}
              className="bc-auth__input"
              type="text"
              autoComplete="off"
              value={apodo}
              maxLength={20}
              aria-invalid={apodoError ? true : undefined}
              aria-describedby={
                apodoError ? `${avisoApodoId} ${apodoErrorId}` : avisoApodoId
              }
              disabled={bloqueado || enviando}
              onChange={(e) => {
                setApodo(e.target.value);
                if (apodoError) {
                  limpiarError();
                }
              }}
            />
            {apodoError ? (
              <div id={apodoErrorId}>
                <Feedback state="incorrecto" message={apodoError} />
              </div>
            ) : null}
          </div>

          <fieldset className="bc-auth__field bc-auth__fieldset">
            <legend id={gradoLabelId} className="bc-auth__label">
              Tu grado
            </legend>
            <div
              className="bc-auth__grados"
              role="radiogroup"
              aria-labelledby={gradoLabelId}
            >
              {([6, 7] as const).map((valor) => {
                const checked = grado === valor;
                return (
                  <label
                    key={valor}
                    className={`bc-auth__grado${
                      checked ? ' bc-auth__grado--activo' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="grado"
                      className="bc-auth__radio"
                      value={valor}
                      checked={checked}
                      disabled={bloqueado || enviando}
                      onChange={() => setGrado(valor)}
                    />
                    <span>{valor}°</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Error general y aviso de bloqueo (Feedback: role=status/aria-live). */}
          {generalError ? (
            <Feedback state="incorrecto" message={generalError} />
          ) : null}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={bloqueado || enviando}
          >
            {bloqueado
              ? `Espera ${segundosRestantes} s`
              : enviando
                ? 'Entrando…'
                : 'Entrar'}
          </Button>
        </form>

        {/* Entrada separada del docente (R6.5). Solo si el host la provee. */}
        {onSoyDocente ? (
          <p className="bc-auth__docente">
            <Button variant="ghost" onClick={onSoyDocente}>
              Soy docente
            </Button>
          </p>
        ) : null}

        {/* Acceso a la política de privacidad (R8.4), sin obligar a leerla. */}
        {onVerPrivacidad ? (
          <p className="bc-auth__privacidad">
            <Button variant="ghost" onClick={onVerPrivacidad}>
              Privacidad
            </Button>
          </p>
        ) : null}
      </Card>
    </main>
  );
}
