import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ejercicioSchema } from '../../../content';
import type { Ejercicio } from '../../../content/types';
import { EjercicioForm } from './EjercicioForm';
import { erroresEjercicio } from './validation';

/**
 * Pruebas de `EjercicioForm`: el selector de tipo cambia el sub-formulario y
 * reinicia los campos propios (el resultado respeta `.strict()`), y la
 * validación en vivo muestra el error de la regla de retroalimentación
 * formativa con `role="alert"`.
 */

const base: Ejercicio = {
  id: 'e-1',
  tipo: 'opcion_multiple',
  enunciado: '¿Qué es convivir?',
  retroalimentacion: undefined,
  meta: { tema: 'Convivencia', etiquetas: [], estado: 'borrador' },
  opciones: [{ id: 'op-1', texto: 'Vivir en paz', esCorrecta: true }],
};

function Harness({ inicial }: { inicial: Ejercicio }) {
  const [ej, setEj] = useState<Ejercicio>(inicial);
  return <EjercicioForm ejercicio={ej} errores={erroresEjercicio(ej)} onChange={setEj} />;
}

describe('EjercicioForm', () => {
  it('cambiar de tipo reinicia los campos: el objeto resultante respeta el esquema', async () => {
    const user = userEvent.setup();
    let ultimo: Ejercicio = base;
    function Captura() {
      const [ej, setEj] = useState<Ejercicio>(base);
      ultimo = ej;
      return (
        <EjercicioForm
          ejercicio={ej}
          errores={erroresEjercicio(ej)}
          onChange={(e) => {
            ultimo = e;
            setEj(e);
          }}
        />
      );
    }
    render(<Captura />);
    await user.click(screen.getByRole('radio', { name: 'Verdadero / Falso' }));
    expect(ultimo.tipo).toBe('verdadero_falso');
    // No arrastra `opciones` del tipo anterior (respeta .strict()).
    expect('opciones' in ultimo).toBe(false);
    // Un verdadero_falso con justificación válida parsea; sin ella, falla el esquema.
    expect(ejercicioSchema.safeParse({ ...ultimo, justificacion: 'Porque sí.' }).success).toBe(true);
  });

  it('muestra el error de retroalimentación formativa con role="alert"', () => {
    render(<Harness inicial={base} />);
    const alertas = screen.getAllByRole('alert');
    expect(alertas.some((a) => /retroalimentación formativa/i.test(a.textContent ?? ''))).toBe(
      true,
    );
  });

  it('presenta el selector de tipo como radiogroup y el enunciado con label', () => {
    render(<Harness inicial={base} />);
    expect(screen.getByRole('radiogroup', { name: 'Tipo de ejercicio' })).toBeInTheDocument();
    expect(screen.getByLabelText('Enunciado')).toHaveValue('¿Qué es convivir?');
  });
});
