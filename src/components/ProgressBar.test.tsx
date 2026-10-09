import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('expone role progressbar con valores aria y etiqueta', () => {
    render(<ProgressBar label="Unidad 1" value={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Unidad 1' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('muestra el porcentaje como texto visible (no solo barra/color)', () => {
    render(<ProgressBar label="Unidad 1" value={65} />);
    expect(screen.getByText('65 %')).toBeInTheDocument();
  });

  it('acota el valor dentro del rango', () => {
    render(<ProgressBar label="Unidad 1" value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});
