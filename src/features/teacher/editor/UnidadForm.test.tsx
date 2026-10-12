import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Unidad } from '../../../content/types';
import { UnidadForm } from './UnidadForm';
import { erroresUnidad } from './validation';

/**
 * Pruebas del formulario de unidad: labels asociadas, errores con role="alert"
 * y que la Cátedra de la Paz es requerida (ejePaz, temáticas min 1 y "cómo").
 */

const unidadValida: Unidad = {
  id: 'u6-conv',
  titulo: 'Convivencia',
  descripcion: 'Aprendemos a convivir.',
  orden: 1,
  objetivos: ['Reconocer el conflicto'],
  ejePaz: true,
  catedraPaz: {
    tematicas: ['Cultura de la paz'],
    como: 'Trabaja la resolución pacífica de conflictos.',
  },
  lecciones: [],
};

describe('UnidadForm', () => {
  it('asocia los controles principales con su label', () => {
    render(<UnidadForm unidad={unidadValida} errores={{}} onEditar={() => {}} />);
    expect(screen.getByLabelText('Título de la unidad')).toHaveValue('Convivencia');
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Orden')).toBeInTheDocument();
    expect(
      screen.getByLabelText('¿Cómo aborda la unidad la Cátedra de la Paz?'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/trabaja la Cátedra de la Paz como eje transversal/i),
    ).toBeChecked();
  });

  it('muestra con role="alert" que falta al menos una temática', () => {
    const unidadSinTematica: Unidad = {
      ...unidadValida,
      catedraPaz: { tematicas: [], como: 'algo' },
    };
    render(
      <UnidadForm
        unidad={unidadSinTematica}
        errores={erroresUnidad(unidadSinTematica)}
        onEditar={() => {}}
      />,
    );
    const alertas = screen.getAllByRole('alert');
    expect(alertas.some((a) => /al menos una temática/.test(a.textContent ?? ''))).toBe(true);
  });

  it('muestra con role="alert" que falta el "cómo" de la Cátedra de la Paz', () => {
    const unidadSinComo: Unidad = {
      ...unidadValida,
      catedraPaz: { tematicas: ['Cultura de la paz'], como: '' },
    };
    render(
      <UnidadForm
        unidad={unidadSinComo}
        errores={erroresUnidad(unidadSinComo)}
        onEditar={() => {}}
      />,
    );
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('añadir una temática invoca onEditar con la lista ampliada', async () => {
    const user = userEvent.setup();
    const onEditar = vi.fn();
    render(<UnidadForm unidad={unidadValida} errores={{}} onEditar={onEditar} />);
    await user.click(screen.getByRole('button', { name: 'Añadir temática' }));
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({
        catedraPaz: expect.objectContaining({
          tematicas: ['Cultura de la paz', ''],
        }),
      }),
    );
  });
});
