import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ejercicioSchema } from '../../../../content';
import type { Dilema } from '../../../../content/types';
import { DilemaFields } from './DilemaFields';

/**
 * Pruebas de `dilema`: con escenario y posturas con reflexión valida (no exige
 * retroalimentación del ejercicio); colar un campo de "correcta" rompe el
 * `.strict()`; sin opciones no valida.
 */

const base: Dilema = {
  id: 'e-1',
  tipo: 'dilema',
  enunciado: '¿Qué harías ante un conflicto en el salón?',
  meta: { tema: 'Convivencia', etiquetas: [], estado: 'borrador' },
  escenario: 'Dos compañeros discuten por un puesto.',
  opciones: [
    { id: 'op-1', texto: 'Dialogar', reflexion: 'El diálogo busca entender al otro.' },
    { id: 'op-2', texto: 'Ignorar', reflexion: 'Ignorar puede dejar el conflicto sin resolver.' },
  ],
};

function Harness({ inicial }: { inicial: Dilema }) {
  const [ej, setEj] = useState<Dilema>(inicial);
  return (
    <DilemaFields
      ejercicio={ej}
      errores={{}}
      onEditar={(campos) => setEj((a) => ({ ...a, ...campos }))}
    />
  );
}

describe('DilemaFields', () => {
  it('con escenario y posturas con reflexión valida (sin exigir retroalimentación)', () => {
    expect(ejercicioSchema.safeParse(base).success).toBe(true);
  });

  it('un campo de "correcta" en una opción rompe el .strict()', () => {
    const invalido = {
      ...base,
      opciones: [{ ...base.opciones[0], esCorrecta: true }, base.opciones[1]],
    };
    expect(ejercicioSchema.safeParse(invalido).success).toBe(false);
  });

  it('sin posturas NO valida', () => {
    expect(ejercicioSchema.safeParse({ ...base, opciones: [] }).success).toBe(false);
  });

  it('no renderiza ningún control de "respuesta correcta"', () => {
    render(<Harness inicial={base} />);
    expect(screen.queryByRole('checkbox', { name: /correcta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /correcta/i })).not.toBeInTheDocument();
  });
});
