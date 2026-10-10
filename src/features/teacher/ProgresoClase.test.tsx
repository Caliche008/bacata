import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ResumenEstudiante } from './progress-service';
import { ProgresoClase } from './ProgresoClase';

/** Pruebas de la UI de progreso (R6.2): apodo + %, sin hash ni PII. */

const RESUMEN: ResumenEstudiante[] = [
  {
    estudianteId: 'est-1',
    apodo: 'Explorador',
    leccionesCompletadas: 2,
    totalLecciones: 8,
    porUnidad: [
      {
        unidadId: 'u1',
        titulo: 'Convivencia',
        ejePaz: true,
        porcentaje: 50,
        completadas: 1,
        total: 2,
      },
    ],
  },
];

describe('ProgresoClase', () => {
  it('muestra el apodo y el porcentaje por unidad', () => {
    render(<ProgresoClase resumen={RESUMEN} />);
    expect(screen.getByText('Explorador')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Convivencia' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 de 8 lecciones completadas')).toBeInTheDocument();
  });

  it('marca la Cátedra de la Paz con texto (no solo color)', () => {
    render(<ProgresoClase resumen={RESUMEN} />);
    expect(screen.getByText('Cátedra de la Paz')).toBeInTheDocument();
  });

  it('nunca renderiza el hash docente', () => {
    const { container } = render(<ProgresoClase resumen={RESUMEN} />);
    expect(container.textContent).not.toContain('salt:hash');
    expect(container.textContent).not.toMatch(/docentePinHash/i);
  });

  it('muestra un vacío amable si no hay estudiantes', () => {
    render(<ProgresoClase resumen={[]} />);
    expect(screen.getByText(/Todavía no hay estudiantes/i)).toBeInTheDocument();
  });
});
