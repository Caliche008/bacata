import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza un <button> accesible por su nombre', () => {
    render(<Button>Empezar</Button>);
    const button = screen.getByRole('button', { name: 'Empezar' });
    expect(button).toBeInTheDocument();
  });

  it('usa type="button" por defecto', () => {
    render(<Button>Repasar</Button>);
    expect(screen.getByRole('button', { name: 'Repasar' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('invoca onClick al activarse', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Siguiente</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('reenvía atributos aria', () => {
    render(<Button aria-label="Continuar la lección">Ir</Button>);
    expect(
      screen.getByRole('button', { name: 'Continuar la lección' }),
    ).toBeInTheDocument();
  });
});
