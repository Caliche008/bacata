import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { metaSchema } from '../../../content';
import type { Meta } from '../../../content/types';
import { MetaForm } from './MetaForm';

/**
 * Pruebas de `MetaForm`: labels asociadas, el objeto resultante valida contra
 * `metaSchema`, y al marcar "sensible" se sugiere la nota de contexto con
 * `role="alert"`.
 */

const base: Meta = { tema: 'Convivencia', etiquetas: [], estado: 'borrador' };

function Harness({ inicial }: { inicial: Meta }) {
  const [meta, setMeta] = useState<Meta>(inicial);
  return (
    <MetaForm meta={meta} errores={{}} onEditar={(campos) => setMeta((a) => ({ ...a, ...campos }))} />
  );
}

describe('MetaForm', () => {
  it('una meta con tema y estado valida contra metaSchema', () => {
    expect(metaSchema.safeParse(base).success).toBe(true);
  });

  it('asocia el tema con su label y el estado como radiogroup', () => {
    render(<Harness inicial={base} />);
    expect(screen.getByLabelText('Tema')).toHaveValue('Convivencia');
    expect(screen.getByRole('radiogroup', { name: 'Estado del contenido' })).toBeInTheDocument();
  });

  it('al marcar sensible sugiere la nota de contexto con role="alert"', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    await user.click(screen.getByRole('checkbox', { name: /tema sensible/i }));
    const alertas = screen.getAllByRole('alert');
    expect(alertas.some((a) => /nota de contexto/i.test(a.textContent ?? ''))).toBe(true);
  });

  it('activar la fuente y darle título produce una meta válida con fuente', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    await user.click(screen.getByRole('checkbox', { name: /cita una fuente/i }));
    await user.type(screen.getByLabelText('Título de la fuente'), 'Constitución de 1991');
    expect(screen.getByLabelText('Título de la fuente')).toHaveValue('Constitución de 1991');
  });
});
