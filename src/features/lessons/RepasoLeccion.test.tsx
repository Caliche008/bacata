import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadBundledCourses, getCursoPorGrado, type Curso } from '../../content';
import { closeDb, getGamification, getReview, putReview, resetDb } from '../../lib/storage';
import { reviewId } from '../../lib/storage';
import RepasoLeccion from './RepasoLeccion';

/**
 * Pruebas de la lección de repaso (tarea 11, R14.2/R14.3) con Testing Library y
 * `fake-indexeddb`. Siembra un `Repaso` due para un ejercicio real del curso
 * semilla, reutiliza el flujo real de `LeccionDetalle` para presentarlo y
 * verifica el espaciado + la XP (+5) al completar.
 */

const ESTUDIANTE = 'est-repaso';
const AHORA = 1_700_000_000_000;

// Ejercicio de opción múltiple real del curso de 6° (su opción "a" es correcta).
const EJERCICIO_DUE = 'e6-conv-1-1';

function cargarCurso6(): Curso {
  const { index } = loadBundledCourses();
  const curso = getCursoPorGrado(index, 6);
  if (!curso) {
    throw new Error('No se cargó el curso de 6°');
  }
  return curso;
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('RepasoLeccion — sin ejercicios due', () => {
  it('muestra el estado "nada por repasar"', async () => {
    render(
      <RepasoLeccion
        estudianteId={ESTUDIANTE}
        curso={cargarCurso6()}
        onVolver={vi.fn()}
      />,
    );
    expect(await screen.findByText('¡Nada por repasar!')).toBeInTheDocument();
  });
});

describe('RepasoLeccion — con ejercicios due (R14.2/R14.3)', () => {
  it('presenta el ejercicio due y al acertarlo lo espacia y suma +5 XP', async () => {
    const user = userEvent.setup();
    // Siembra un fallo due (proximaAparicion en el pasado) con fallos=2 para que
    // acertar lo espacie en vez de eliminarlo.
    await putReview({
      id: reviewId(ESTUDIANTE, EJERCICIO_DUE),
      estudianteId: ESTUDIANTE,
      ejercicioId: EJERCICIO_DUE,
      fallos: 2,
      proximaAparicion: AHORA - 1,
    });

    const onRepasoCompletado = vi.fn();
    render(
      <RepasoLeccion
        estudianteId={ESTUDIANTE}
        curso={cargarCurso6()}
        onVolver={vi.fn()}
        onRepasoCompletado={onRepasoCompletado}
      />,
    );

    // El flujo real presenta el ejercicio due reutilizando los renderizadores.
    await user.click(
      await screen.findByLabelText('Dos compañeros dialogan y acuerdan turnarse la cancha.'),
    );
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    await user.click(await screen.findByRole('button', { name: 'Terminar' }));

    await waitFor(() => expect(onRepasoCompletado).toHaveBeenCalled());

    // Espaciado: el record sigue existiendo pero con menos fallos (R14.3).
    await waitFor(async () => {
      const repaso = await getReview(ESTUDIANTE, EJERCICIO_DUE);
      expect(repaso?.fallos).toBe(1);
    });

    // XP de repaso aplicada (+5).
    const gamificacion = await getGamification(ESTUDIANTE);
    expect(gamificacion?.xp).toBe(5);
  });
});
