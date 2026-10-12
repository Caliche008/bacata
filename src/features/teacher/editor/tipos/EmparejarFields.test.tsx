import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ejercicioSchema } from '../../../../content';
import type { Emparejar } from '../../../../content/types';
import { EmparejarFields } from './EmparejarFields';

/**
 * Pruebas de `emparejar`: con retroalimentación del ejercicio y al menos un par
 * valida; sin par válido no valida.
 */

const base: Emparejar = {
  id: 'e-1',
  tipo: 'emparejar',
  enunciado: 'Empareja el derecho con su ejemplo.',
  retroalimentacion: 'Cada derecho tiene un ejemplo cotidiano.',
  meta: { tema: 'Derechos', etiquetas: [], estado: 'borrador' },
  pares: [{ izquierda: 'Educación', derecha: 'Ir a la escuela' }],
};

function Harness({ inicial }: { inicial: Emparejar }) {
  const [ej, setEj] = useState<Emparejar>(inicial);
  return (
    <EmparejarFields
      ejercicio={ej}
      errores={{}}
      onEditar={(campos) => setEj((a) => ({ ...a, ...campos }))}
    />
  );
}

describe('EmparejarFields', () => {
  it('con un par y retroalimentación valida contra el esquema', () => {
    expect(ejercicioSchema.safeParse(base).success).toBe(true);
  });

  it('sin pares NO valida', () => {
    expect(ejercicioSchema.safeParse({ ...base, pares: [] }).success).toBe(false);
  });

  it('añadir un par expone un segundo lado izquierdo editable', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    await user.click(screen.getByRole('button', { name: 'Añadir par' }));
    expect(screen.getByLabelText('Lado izquierdo del par 2')).toBeInTheDocument();
  });
});
