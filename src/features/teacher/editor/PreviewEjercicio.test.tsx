import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Ejercicio } from '../../../content/types';
import { PreviewEjercicio } from './PreviewEjercicio';

/**
 * Pruebas de `PreviewEjercicio`: previsualiza reutilizando el `ExerciseRenderer`
 * del estudiante (no reimplementa renderizadores) y lo monta deshabilitado; si
 * el ejercicio aún no valida, avisa en vez de romper.
 */

const valido: Ejercicio = {
  id: 'e-1',
  tipo: 'opcion_multiple',
  enunciado: '¿Qué es convivir?',
  meta: { tema: 'Convivencia', etiquetas: [], estado: 'borrador' },
  opciones: [
    { id: 'op-1', texto: 'Vivir en paz', esCorrecta: true, retro: 'Correcto: convivir es vivir en paz.' },
    { id: 'op-2', texto: 'Pelear', esCorrecta: false, retro: 'No: pelear no es convivir.' },
  ],
};

describe('PreviewEjercicio', () => {
  it('reutiliza el renderizador del estudiante y lo deja deshabilitado', () => {
    render(<PreviewEjercicio ejercicio={valido} />);

    // El enunciado del ejercicio aparece (lo pinta el ExerciseRenderer real).
    expect(screen.getByText('¿Qué es convivir?')).toBeInTheDocument();
    // Las opciones son radios y están deshabilitadas (vista previa, no se responde).
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(2);
    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }
  });

  it('cuando el ejercicio no valida, avisa en vez de romper', () => {
    // Opción múltiple sin opciones: no cumple ejercicioSchema.
    const invalido = { ...valido, opciones: [] } as unknown as Ejercicio;
    render(<PreviewEjercicio ejercicio={invalido} />);

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/completa el ejercicio/i);
  });
});
