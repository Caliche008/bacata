import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { ThemeProvider } from './ThemeProvider';

describe('App', () => {
  it('muestra el encabezado de la marca', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole('heading', { name: 'Bacatá', level: 1 }),
    ).toBeInTheDocument();
  });
});
