import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Curso } from '../../../content/types';
import { CursoForm } from './CursoForm';
import { erroresCurso } from './validation';

/**
 * Pruebas de accesibilidad del formulario de curso: cada control tiene su label
 * asociada y los errores aparecen con `role="alert"`.
 */

const cursoVacio: Curso = {
  id: '',
  grado: 6,
  area: 'ciencias_sociales',
  titulo: '',
  descripcion: '',
  version: '',
  unidades: [],
};

describe('CursoForm', () => {
  it('asocia cada control con su label', () => {
    render(
      <CursoForm
        curso={{ ...cursoVacio, titulo: 'Ciencias Sociales 6°' }}
        errores={{}}
        onCambiarGrado={() => {}}
        onEditar={() => {}}
      />,
    );
    expect(screen.getByLabelText('Título del curso')).toHaveValue('Ciencias Sociales 6°');
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Versión del contenido')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Grado del curso' })).toBeInTheDocument();
  });

  it('muestra el error del campo con role="alert"', () => {
    render(
      <CursoForm
        curso={cursoVacio}
        errores={erroresCurso(cursoVacio)}
        onCambiarGrado={() => {}}
        onEditar={() => {}}
      />,
    );
    const alertas = screen.getAllByRole('alert');
    expect(alertas.length).toBeGreaterThan(0);
    expect(alertas.some((a) => /no puede estar vacío/.test(a.textContent ?? ''))).toBe(true);
  });

  it('cambiar el grado invoca onCambiarGrado', async () => {
    const user = userEvent.setup();
    const onCambiarGrado = vi.fn();
    render(
      <CursoForm
        curso={cursoVacio}
        errores={{}}
        onCambiarGrado={onCambiarGrado}
        onEditar={() => {}}
      />,
    );
    await user.click(screen.getByRole('radio', { name: '8°' }));
    expect(onCambiarGrado).toHaveBeenCalledWith(8);
  });
});
