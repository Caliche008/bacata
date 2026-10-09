import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Curso } from '../../content';
import { PanelProgreso } from './PanelProgreso';
import { LOGRO_RACHA_7, PREFIJO_UNIDAD_COMPLETADA } from './logros';

/**
 * Pruebas del panel "Mi progreso" (tarea 10.4, parte UI): lista logros con
 * título y descripción (ícono + texto), muestra el % de eje Paz con
 * `ProgressBar`, estado vacío amable y SIN rankings/comparaciones entre
 * estudiantes (R4.4).
 */

const curso: Curso = {
  id: 'c6',
  grado: 6,
  area: 'ciencias_sociales',
  titulo: 'Curso 6',
  descripcion: 'Desc',
  version: '1.0.0',
  unidades: [
    {
      id: 'u-convivencia',
      titulo: 'Convivencia',
      descripcion: 'Desc',
      orden: 1,
      objetivos: [],
      ejePaz: true,
      catedraPaz: { tematicas: ['Convivencia'], como: 'Transversal' },
      lecciones: [],
    },
  ],
};

const onCerrar = vi.fn();

describe('PanelProgreso', () => {
  it('lista los logros con título y descripción (ícono + texto)', () => {
    render(
      <PanelProgreso
        logros={[LOGRO_RACHA_7, `${PREFIJO_UNIDAD_COMPLETADA}u-convivencia`]}
        avanceEjePaz={{ porcentaje: 50, completadas: 1, total: 2 }}
        curso={curso}
        onCerrar={onCerrar}
      />,
    );

    // Logro fijo (racha) resuelto desde el catálogo.
    expect(screen.getByText('¡Una semana de constancia!')).toBeInTheDocument();
    // Logro de unidad resuelto con el título de la unidad del curso.
    expect(screen.getByText('¡Completaste "Convivencia"!')).toBeInTheDocument();
  });

  it('muestra el % de eje Paz con una ProgressBar accesible', () => {
    render(
      <PanelProgreso
        logros={[]}
        avanceEjePaz={{ porcentaje: 50, completadas: 1, total: 2 }}
        curso={curso}
        onCerrar={onCerrar}
      />,
    );

    const barra = screen.getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '50');
    expect(barra).toHaveAttribute('aria-valuetext', '50 %');
  });

  it('muestra un estado vacío amable cuando no hay logros', () => {
    render(
      <PanelProgreso
        logros={[]}
        avanceEjePaz={{ porcentaje: 0, completadas: 0, total: 0 }}
        curso={curso}
        onCerrar={onCerrar}
      />,
    );

    expect(screen.getByText(/Aún no tienes logros/)).toBeInTheDocument();
  });

  it('no incluye rankings ni comparaciones entre estudiantes (R4.4)', () => {
    const { container } = render(
      <PanelProgreso
        logros={[LOGRO_RACHA_7]}
        avanceEjePaz={{ porcentaje: 100, completadas: 2, total: 2 }}
        curso={curso}
        onCerrar={onCerrar}
      />,
    );

    expect(container.textContent ?? '').not.toMatch(/ranking|posición|puesto|compañeros/i);
  });

  it('es un diálogo accesible con nombre', () => {
    render(
      <PanelProgreso
        logros={[]}
        avanceEjePaz={{ porcentaje: 0, completadas: 0, total: 0 }}
        curso={curso}
        onCerrar={onCerrar}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Mi progreso' })).toBeInTheDocument();
  });
});
