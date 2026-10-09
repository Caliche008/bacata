import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Feedback } from './Feedback';

describe('Feedback', () => {
  it('anuncia el estado con role status', () => {
    render(<Feedback state="correcto" message="¡Muy bien! Así se razona." />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('¡Muy bien! Así se razona.');
  });

  it('transmite el estado con texto + ícono (no solo color)', () => {
    const { container } = render(
      <Feedback state="incorrecto" message="Casi. Vuelve a intentarlo." />,
    );
    // Texto presente.
    expect(screen.getByText('Casi. Vuelve a intentarlo.')).toBeInTheDocument();
    // Ícono SVG presente y decorativo (el significado va en el texto).
    const icon = container.querySelector('svg.bc-feedback__icon');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('muestra la pista opcional', () => {
    render(
      <Feedback
        state="incorrecto"
        message="Casi."
        hint="Piensa en quién cuenta la historia."
      />,
    );
    expect(
      screen.getByText('Piensa en quién cuenta la historia.'),
    ).toBeInTheDocument();
  });

  it('usa microcopy de marca por defecto si el mensaje viene vacío', () => {
    render(<Feedback state="correcto" message="" />);
    expect(screen.getByText('¡Muy bien! Así se razona.')).toBeInTheDocument();
  });
});
