import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ejercicioSchema } from '../../../../content';
import type { OpcionMultiple } from '../../../../content/types';
import { OpcionMultipleFields } from './OpcionMultipleFields';

/**
 * Pruebas de `opcion_multiple`: el objeto resultante valida contra
 * `ejercicioSchema` (incluida la regla de retroalimentación formativa) y los
 * casos inválidos (sin retro ni retroalimentación) no validan.
 */

const base: OpcionMultiple = {
  id: 'e-1',
  tipo: 'opcion_multiple',
  enunciado: '¿Qué es la convivencia?',
  retroalimentacion: undefined,
  meta: { tema: 'Convivencia', etiquetas: [], estado: 'borrador' },
  opciones: [{ id: 'op-1', texto: 'Vivir en paz', esCorrecta: true }],
};

function Harness({ inicial }: { inicial: OpcionMultiple }) {
  const [ej, setEj] = useState<OpcionMultiple>(inicial);
  return (
    <OpcionMultipleFields
      ejercicio={ej}
      errores={{}}
      onEditar={(campos) => setEj((a) => ({ ...a, ...campos }))}
    />
  );
}

describe('OpcionMultipleFields', () => {
  it('un ejercicio con retro por opción valida contra el esquema', () => {
    const valido: OpcionMultiple = {
      ...base,
      opciones: [
        { id: 'op-1', texto: 'Vivir en paz', esCorrecta: true, retro: 'Correcto, es convivir.' },
      ],
    };
    expect(ejercicioSchema.safeParse(valido).success).toBe(true);
  });

  it('sin retro por opción ni retroalimentación del ejercicio NO valida (regla formativa)', () => {
    const resultado = ejercicioSchema.safeParse(base);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((i) => i.message).join(' ');
      expect(mensajes).toMatch(/retroalimentación formativa/);
    }
  });

  it('añadir una opción produce un objeto con dos opciones', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    await user.click(screen.getByRole('button', { name: 'Añadir opción' }));
    expect(screen.getByLabelText('Opción 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Opción 2')).toBeInTheDocument();
  });

  it('la opción correcta se marca con casilla (no solo color)', () => {
    render(<Harness inicial={base} />);
    expect(screen.getByRole('checkbox', { name: /respuesta correcta/i })).toBeChecked();
  });
});
