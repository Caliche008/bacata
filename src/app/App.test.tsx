import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('muestra el encabezado de la marca', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Bacatá', level: 1 }),
    ).toBeInTheDocument();
  });
});
