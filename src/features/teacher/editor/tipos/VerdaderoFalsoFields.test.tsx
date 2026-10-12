import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ejercicioSchema } from '../../../../content';
import type { VerdaderoFalso } from '../../../../content/types';
import { VerdaderoFalsoFields } from './VerdaderoFalsoFields';

/**
 * Pruebas de `verdadero_falso`: con justificación valida (la justificación es
 * la retroalimentación formativa del tipo); sin justificación no valida.
 */

const base: VerdaderoFalso = {
  id: 'e-1',
  tipo: 'verdadero_falso',
  enunciado: 'La paz es un derecho.',
  meta: { tema: 'Derechos', etiquetas: [], estado: 'borrador' },
  respuestaCorrecta: true,
  justificacion: 'La paz es un derecho y un deber, según la Constitución.',
};

function Harness({ inicial }: { inicial: VerdaderoFalso }) {
  const [ej, setEj] = useState<VerdaderoFalso>(inicial);
  return (
    <VerdaderoFalsoFields
      ejercicio={ej}
      errores={{}}
      onEditar={(campos) => setEj((a) => ({ ...a, ...campos }))}
    />
  );
}

describe('VerdaderoFalsoFields', () => {
  it('con justificación valida contra el esquema', () => {
    expect(ejercicioSchema.safeParse(base).success).toBe(true);
  });

  it('sin justificación NO valida', () => {
    expect(ejercicioSchema.safeParse({ ...base, justificacion: '' }).success).toBe(false);
  });

  it('expone un radiogroup Verdadero/Falso y edita la respuesta', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    expect(screen.getByRole('radiogroup', { name: 'Respuesta correcta' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Falso' }));
    expect(screen.getByRole('radio', { name: 'Falso' })).toBeChecked();
  });
});
