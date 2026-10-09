import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Ejercicio, Leccion } from '../../content';
import { closeDb, getProgressForLesson, resetDb } from '../../lib/storage';
import type { ResumenLeccion } from './answers';
import LeccionDetalle from './LeccionDetalle';

/**
 * Pruebas de flujo (9.5d) con Testing Library sobre el componente real:
 * acierto/error+reintento con retroalimentación por texto+ícono (R3.2/R3.6),
 * dilema con reflexión sin veredicto (R3.3), fuente mostrada (R3.8), omitir un
 * sensible sin bloquear (R12.4), completar la lección → progreso + resumen
 * (R3.4). Se usa `fake-indexeddb` para la persistencia.
 */

const ESTUDIANTE = 'est-flujo';

function metaBase(extra?: Partial<Ejercicio['meta']>): Ejercicio['meta'] {
  return { tema: 'Convivencia', etiquetas: ['paz'], estado: 'aprobado', ...extra };
}

const opcionMultiple: Ejercicio = {
  id: 'e1',
  tipo: 'opcion_multiple',
  enunciado: '¿Qué resuelve mejor un conflicto?',
  opciones: [
    { id: 'a', texto: 'El diálogo', esCorrecta: true, retro: 'Así es, el diálogo construye.' },
    { id: 'b', texto: 'La agresión', esCorrecta: false, retro: 'Casi, eso lo profundiza.' },
  ],
  retroalimentacion: 'El diálogo resuelve mejor.',
  meta: metaBase(),
};

const dilema: Ejercicio = {
  id: 'e2',
  tipo: 'dilema',
  enunciado: '¿Qué harías?',
  escenario: 'Un compañero te empuja sin querer.',
  opciones: [
    { id: 'o1', texto: 'Le empujo de vuelta', reflexion: 'La agresión aumenta el conflicto.' },
    { id: 'o2', texto: 'Le digo con calma', reflexion: 'Expresar sin agredir abre el diálogo.' },
  ],
  retroalimentacion: 'No hay respuesta única.',
  meta: metaBase({ etiquetas: ['paz', 'pensamiento_critico'] }),
};

const conFuente: Ejercicio = {
  id: 'e3',
  tipo: 'opcion_multiple',
  enunciado: 'Según la fuente, ¿qué hicieron?',
  opciones: [
    { id: 'a', texto: 'Un acuerdo', esCorrecta: true, retro: 'Correcto.' },
    { id: 'b', texto: 'Nada', esCorrecta: false, retro: 'Casi.' },
  ],
  retroalimentacion: 'Analizar fuentes ayuda a entender.',
  meta: metaBase({
    fuente: { titulo: 'Testimonio estudiantil Bacatá', autor: 'Material propio' },
  }),
};

const sensible: Ejercicio = {
  id: 'e4',
  tipo: 'opcion_multiple',
  enunciado: 'Pregunta sensible',
  opciones: [
    { id: 'a', texto: 'Opción', esCorrecta: true, retro: 'Correcto.' },
    { id: 'b', texto: 'Otra', esCorrecta: false, retro: 'Casi.' },
  ],
  retroalimentacion: 'Retro.',
  meta: metaBase({
    sensible: true,
    notaContexto: 'Este tema trata la memoria histórica con respeto.',
  }),
};

function leccionCon(ejercicios: Ejercicio[]): Leccion {
  return {
    id: 'l-flujo',
    titulo: '¿Qué es un conflicto?',
    objetivoAprendizaje: 'Comprender el conflicto',
    competencia: 'Competencias ciudadanas',
    orden: 1,
    ejercicios,
  };
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('LeccionDetalle — retroalimentación (R3.2/R3.6)', () => {
  it('un acierto anuncia por texto+ícono (role=status) y muestra la mascota', async () => {
    const user = userEvent.setup();
    render(
      <LeccionDetalle
        leccion={leccionCon([opcionMultiple])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={vi.fn()}
      />,
    );

    await user.click(await screen.findByLabelText('El diálogo'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('¡Muy bien! Así se razona.');
    // La retro específica aparece como texto (en la pista y en la burbuja de la mascota).
    expect(screen.getAllByText('Así es, el diálogo construye.').length).toBeGreaterThan(0);
  });

  it('un error muestra pista y permite Reintentar hasta acertar', async () => {
    const user = userEvent.setup();
    render(
      <LeccionDetalle
        leccion={leccionCon([opcionMultiple])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={vi.fn()}
      />,
    );

    await user.click(await screen.findByLabelText('La agresión'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Casi. Mira esta pista y vuelve a intentarlo.',
    );
    const reintentar = screen.getByRole('button', { name: 'Reintentar' });
    expect(reintentar).toBeInTheDocument();

    await user.click(reintentar);
    await user.click(await screen.findByLabelText('El diálogo'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    expect(await screen.findByRole('status')).toHaveTextContent('¡Muy bien! Así se razona.');
  });
});

describe('LeccionDetalle — dilema (R3.3)', () => {
  it('muestra la reflexión sin marcar correcto/incorrecto', async () => {
    const user = userEvent.setup();
    render(
      <LeccionDetalle
        leccion={leccionCon([dilema])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={vi.fn()}
      />,
    );

    await user.click(await screen.findByLabelText('Le digo con calma'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Para pensar');
    expect(screen.getByText('Expresar sin agredir abre el diálogo.')).toBeInTheDocument();
    // No se muestran los mensajes de acierto/error del evaluable.
    expect(screen.queryByText('¡Muy bien! Así se razona.')).toBeNull();
    // Puede avanzar sin "respuesta correcta".
    expect(screen.getByRole('button', { name: 'Terminar' })).toBeInTheDocument();
  });
});

describe('LeccionDetalle — fuente (R3.8)', () => {
  it('muestra el crédito de la fuente del ejercicio', async () => {
    render(
      <LeccionDetalle
        leccion={leccionCon([conFuente])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={vi.fn()}
      />,
    );
    expect(await screen.findByText(/Testimonio estudiantil Bacatá/)).toBeInTheDocument();
  });
});

describe('LeccionDetalle — sensible (R12.4)', () => {
  it('permite omitir un sensible y completar igual la lección', async () => {
    const user = userEvent.setup();
    const onLeccionCompletada = vi.fn<(resumen: ResumenLeccion) => void>();
    const onCompletada = vi.fn();
    render(
      <LeccionDetalle
        leccion={leccionCon([sensible, opcionMultiple])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={onCompletada}
        onLeccionCompletada={onLeccionCompletada}
      />,
    );

    // Aparece el aviso sensible con la nota de contexto.
    expect(await screen.findByText(/memoria histórica con respeto/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Omitir este ejercicio' }));

    // Pasa al segundo ejercicio evaluable y se resuelve.
    await user.click(await screen.findByLabelText('El diálogo'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    await user.click(await screen.findByRole('button', { name: 'Terminar' }));

    await waitFor(() => expect(onCompletada).toHaveBeenCalled());
    const resumen = onLeccionCompletada.mock.calls[0][0];
    expect(resumen.omitidos).toContain('e4');
    expect(resumen.totalEvaluables).toBe(1);
  });
});

describe('LeccionDetalle — onEjercicioFallado (R14.1)', () => {
  it('invoca onEjercicioFallado una sola vez por aparición, aunque se reintente', async () => {
    const user = userEvent.setup();
    const onEjercicioFallado = vi.fn<(id: string) => void>();
    render(
      <LeccionDetalle
        leccion={leccionCon([opcionMultiple])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={vi.fn()}
        onEjercicioFallado={onEjercicioFallado}
      />,
    );

    // Primer intento incorrecto: se notifica el fallo.
    await user.click(await screen.findByLabelText('La agresión'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    expect(onEjercicioFallado).toHaveBeenCalledTimes(1);
    expect(onEjercicioFallado).toHaveBeenCalledWith('e1');

    // Reintento incorrecto: NO vuelve a notificar el mismo ejercicio.
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await user.click(await screen.findByLabelText('La agresión'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    expect(onEjercicioFallado).toHaveBeenCalledTimes(1);
  });

  it('NO invoca onEjercicioFallado para un dilema (sin veredicto, R3.3)', async () => {
    const user = userEvent.setup();
    const onEjercicioFallado = vi.fn<(id: string) => void>();
    render(
      <LeccionDetalle
        leccion={leccionCon([dilema])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={vi.fn()}
        onEjercicioFallado={onEjercicioFallado}
      />,
    );

    await user.click(await screen.findByLabelText('Le digo con calma'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    expect(onEjercicioFallado).not.toHaveBeenCalled();
  });
});

describe('LeccionDetalle — completar lección (R3.4)', () => {
  it('marca la lección completada en el store y celebra con la mascota', async () => {
    const user = userEvent.setup();
    const onCompletada = vi.fn();
    const { container } = render(
      <LeccionDetalle
        leccion={leccionCon([opcionMultiple])}
        estudianteId={ESTUDIANTE}
        onVolver={vi.fn()}
        onCompletada={onCompletada}
      />,
    );

    await user.click(await screen.findByLabelText('El diálogo'));
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    await user.click(await screen.findByRole('button', { name: 'Terminar' }));

    await waitFor(() => expect(onCompletada).toHaveBeenCalled());
    const guardado = await getProgressForLesson(ESTUDIANTE, 'l-flujo');
    expect(guardado?.estado).toBe('completada');
    // Pantalla de cierre con la mascota celebrando.
    expect(container.querySelector('[data-pose="celebrando"]')).not.toBeNull();
  });
});
