import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CabeceraGamificacion } from './CabeceraGamificacion';

/**
 * Pruebas de la cabecera de gamificación (tarea 10.4, parte UI). Verifican que
 * XP y racha se anuncian por TEXTO (no solo color), que el reinicio de racha
 * muestra un mensaje MOTIVADOR sin castigo, y que hay roles/etiquetas ARIA.
 */

describe('CabeceraGamificacion', () => {
  it('anuncia la XP y la racha por texto, no solo por color', () => {
    render(<CabeceraGamificacion xp={42} rachaActual={3} />);

    // El valor y la unidad aparecen como texto legible.
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('XP')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('días de racha')).toBeInTheDocument();
  });

  it('expone etiquetas ARIA descriptivas para cada métrica', () => {
    render(<CabeceraGamificacion xp={10} rachaActual={1} />);

    expect(
      screen.getByLabelText('10 puntos de experiencia acumulados'),
    ).toBeInTheDocument();
    // Singular correcto cuando la racha es de un día.
    expect(
      screen.getByLabelText('Racha actual: 1 día seguidos'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Tu progreso de gamificación' }),
    ).toBeInTheDocument();
  });

  it('al reiniciar la racha muestra un mensaje motivador sin castigo', () => {
    render(<CabeceraGamificacion xp={10} rachaActual={1} reinicioReciente />);

    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent(/constancia cuenta/i);
    // Tono motivador: nunca palabras de castigo/fracaso.
    expect(aviso.textContent ?? '').not.toMatch(/perdiste|fracas|castig/i);
  });

  it('no muestra el aviso de reinicio cuando no corresponde', () => {
    render(<CabeceraGamificacion xp={10} rachaActual={5} />);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
