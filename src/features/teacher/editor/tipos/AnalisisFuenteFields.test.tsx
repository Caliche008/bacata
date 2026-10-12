import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ejercicioSchema } from '../../../../content';
import type { AnalisisFuente } from '../../../../content/types';
import { AnalisisFuenteFields } from './AnalisisFuenteFields';

/**
 * Pruebas de `analisis_fuente`: con recurso de texto y preguntas con retro por
 * opción valida; una imagen SIN alt no valida (accesibilidad); sin preguntas no
 * valida.
 */

const base: AnalisisFuente = {
  id: 'e-1',
  tipo: 'analisis_fuente',
  enunciado: 'Lee la fuente y responde.',
  meta: { tema: 'Memoria histórica', etiquetas: [], estado: 'borrador' },
  recurso: { clase: 'texto', contenido: 'Fragmento de un testimonio.' },
  preguntas: [
    {
      id: 'pr-1',
      pregunta: '¿Quién cuenta esta historia?',
      opciones: [
        { id: 'op-1', texto: 'Un testigo', esCorrecta: true, retro: 'Correcto, es un testimonio.' },
      ],
    },
  ],
};

function Harness({ inicial }: { inicial: AnalisisFuente }) {
  const [ej, setEj] = useState<AnalisisFuente>(inicial);
  return (
    <AnalisisFuenteFields
      ejercicio={ej}
      errores={{}}
      onEditar={(campos) => setEj((a) => ({ ...a, ...campos }))}
    />
  );
}

describe('AnalisisFuenteFields', () => {
  it('recurso de texto con preguntas y retro por opción valida contra el esquema', () => {
    expect(ejercicioSchema.safeParse(base).success).toBe(true);
  });

  it('imagen CON alt valida contra el esquema', () => {
    const conImagen: AnalisisFuente = {
      ...base,
      recurso: { clase: 'imagen', src: '/img/mural.jpg', alt: 'Mural de la memoria' },
    };
    expect(ejercicioSchema.safeParse(conImagen).success).toBe(true);
  });

  it('imagen SIN alt NO valida (accesibilidad)', () => {
    const sinAlt = {
      ...base,
      recurso: { clase: 'imagen', src: '/img/mural.jpg', alt: '' },
    };
    expect(ejercicioSchema.safeParse(sinAlt).success).toBe(false);
  });

  it('sin preguntas NO valida', () => {
    expect(ejercicioSchema.safeParse({ ...base, preguntas: [] }).success).toBe(false);
  });

  it('al elegir imagen expone el campo alt obligatorio', async () => {
    const user = userEvent.setup();
    render(<Harness inicial={base} />);
    await user.click(screen.getByRole('radio', { name: 'Imagen' }));
    const alt = screen.getByLabelText(/Texto alternativo/i);
    expect(alt).toBeRequired();
  });
});
