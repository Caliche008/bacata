import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Mascota } from './Mascota';

describe('Mascota', () => {
  it('renderiza la pose indicada', () => {
    const { container } = render(<Mascota pose="celebrando" />);
    expect(container.querySelector('[data-pose="celebrando"]')).not.toBeNull();
  });

  it('expone el mensaje como texto accesible y la imagen decorativa oculta', () => {
    const { container } = render(
      <Mascota pose="saludando" message="¡Hola! Soy tu compañero de ruta." />,
    );
    // El mensaje es texto legible por el lector de pantalla.
    expect(
      screen.getByText('¡Hola! Soy tu compañero de ruta.'),
    ).toBeInTheDocument();
    // La ilustración decorativa está oculta para el lector de pantalla
    // (alt vacío + aria-hidden), por eso no expone rol de imagen.
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('aria-hidden', 'true');
    expect(img).toHaveAttribute('alt', '');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('con decorative=false expone la pose como imagen con etiqueta', () => {
    render(
      <Mascota
        pose="feliz"
        decorative={false}
        accessibleLabel="Mascota feliz"
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Mascota feliz' }),
    ).toBeInTheDocument();
  });
});
