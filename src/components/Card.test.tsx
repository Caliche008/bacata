import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('asocia el título a la región con aria-labelledby', () => {
    render(<Card title="Convivencia">contenido</Card>);
    const region = screen.getByRole('region', { name: 'Convivencia' });
    expect(region).toBeInTheDocument();
  });

  it('renderiza el encabezado al nivel indicado', () => {
    render(
      <Card title="Derechos" headingLevel={3}>
        contenido
      </Card>,
    );
    expect(
      screen.getByRole('heading', { name: 'Derechos', level: 3 }),
    ).toBeInTheDocument();
  });

  it('sin título no fuerza una región etiquetada', () => {
    render(<Card>solo contenido</Card>);
    expect(screen.getByText('solo contenido')).toBeInTheDocument();
  });
});
