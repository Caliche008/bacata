import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ejercicioSchema } from '../../../../content';
import type { Ordenar } from '../../../../content/types';
import { OrdenarFields } from './OrdenarFields';

/**
 * Pruebas de `ordenar`: con retroalimentación y elementos valida; sin elementos
 * no valida. Reordenar es accesible por botones Subir/Bajar.
 */

const base: Ordenar = {
  id: 'e-1',
  tipo: 'ordenar',
  enunciado: 'Ordena los pasos para resolver un conflicto.',
  retroalimentacion: 'El diálogo va antes que el acuerdo.',
  meta: { tema: 'Convivencia', etiquetas: [], estado: 'borrador' },
  elementos: [
    { id: 'el-1', texto: 'Escuchar', orden: 1 },
    { id: 'el-2', texto: 'Acordar', orden: 2 },
  ],
};

function Harness({ inicial }: { inicial: Ordenar }) {
  const [ej, setEj] = useState<Ordenar>(inicial);
  return (
    <OrdenarFields
      ejercicio={ej}
      errores={{}}
      onEditar={(campos) => setEj((a) => ({ ...a, ...campos }))}
    />
  );
}

describe('OrdenarFields', () => {
  it('con elementos y retroalimentación valida contra el esquema', () => {
    expect(ejercicioSchema.safeParse(base).success).toBe(true);
  });

  it('sin elementos NO valida', () => {
    expect(ejercicioSchema.safeParse({ ...base, elementos: [] }).success).toBe(false);
  });

  it('bajar el primer elemento lo intercambia con el segundo', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    await user.click(screen.getByRole('button', { name: 'Bajar el elemento 1' }));
    const campos = screen.getAllByRole('textbox');
    expect(campos[0]).toHaveValue('Acordar');
    expect(campos[1]).toHaveValue('Escuchar');
  });
});
