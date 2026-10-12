import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ejercicioSchema } from '../../../../content';
import type { Completar } from '../../../../content/types';
import { CompletarFields } from './CompletarFields';

/**
 * Pruebas de `completar`: con retroalimentación, texto y un hueco con opciones
 * valida; sin huecos no valida. La opción correcta se elige por radio.
 */

const base: Completar = {
  id: 'e-1',
  tipo: 'completar',
  enunciado: 'Completa la frase.',
  retroalimentacion: 'La convivencia se construye con respeto.',
  meta: { tema: 'Convivencia', etiquetas: [], estado: 'borrador' },
  texto: 'La convivencia se construye con ___.',
  huecos: [{ id: 'h-1', opciones: ['respeto', 'miedo'], correcta: 'respeto' }],
};

function Harness({ inicial }: { inicial: Completar }) {
  const [ej, setEj] = useState<Completar>(inicial);
  return (
    <CompletarFields
      ejercicio={ej}
      errores={{}}
      onEditar={(campos) => setEj((a) => ({ ...a, ...campos }))}
    />
  );
}

describe('CompletarFields', () => {
  it('con texto, hueco y retroalimentación valida contra el esquema', () => {
    expect(ejercicioSchema.safeParse(base).success).toBe(true);
  });

  it('sin huecos NO valida', () => {
    expect(ejercicioSchema.safeParse({ ...base, huecos: [] }).success).toBe(false);
  });

  it('la opción correcta se marca con un radio accesible', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    const radioSegunda = screen.getByRole('radio', { name: 'Marcar la opción 2 como correcta' });
    await user.click(radioSegunda);
    expect(radioSegunda).toBeChecked();
  });
});
