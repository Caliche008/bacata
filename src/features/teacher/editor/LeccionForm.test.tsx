import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Leccion } from '../../../content/types';
import { LeccionForm } from './LeccionForm';
import { erroresLeccion } from './validation';

/**
 * Pruebas del formulario de lección: labels asociadas y errores con
 * `role="alert"` enlazados por `aria-describedby`.
 */

const leccionVacia: Leccion = {
  id: 'l6-x',
  titulo: '',
  objetivoAprendizaje: '',
  competencia: '',
  orden: 1,
  ejercicios: [],
};

describe('LeccionForm', () => {
  it('asocia cada control con su label', () => {
    render(
      <LeccionForm
        leccion={{ ...leccionVacia, titulo: '¿Qué es un conflicto?' }}
        errores={{}}
        onEditar={() => {}}
      />,
    );
    expect(screen.getByLabelText('Título de la lección')).toHaveValue('¿Qué es un conflicto?');
    expect(screen.getByLabelText('Objetivo de aprendizaje')).toBeInTheDocument();
    expect(screen.getByLabelText('Competencia')).toBeInTheDocument();
    expect(screen.getByLabelText('Orden')).toBeInTheDocument();
  });

  it('muestra el error del campo con role="alert" y lo enlaza por aria-describedby', () => {
    render(
      <LeccionForm
        leccion={leccionVacia}
        errores={erroresLeccion(leccionVacia)}
        onEditar={() => {}}
      />,
    );
    const titulo = screen.getByLabelText('Título de la lección');
    expect(titulo).toHaveAttribute('aria-invalid', 'true');

    const descrito = titulo.getAttribute('aria-describedby');
    expect(descrito).toBeTruthy();

    const alerta = document.getElementById(descrito ?? '');
    expect(alerta).toHaveAttribute('role', 'alert');
    expect(alerta?.textContent).toMatch(/no puede estar vacío/);
  });
});
