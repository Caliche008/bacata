import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type {
  AnalisisFuente,
  Completar,
  Emparejar,
  Ordenar,
} from '../../../content';
import type { Respuesta } from '../answers';
import { ExerciseRenderer } from './ExerciseRenderer';

/**
 * Regresión directa de la causa raíz del crash en "emparejar" (y sus hermanos).
 *
 * El bug: tras avanzar de un ejercicio a otro de DISTINTO tipo, el flujo pasaba
 * un render con la respuesta STALE del tipo anterior; los renderizadores que
 * indexan/mapean un campo colección (asignaciones, ordenIds, selecciones,
 * respuestas) leían `undefined` y lanzaban → pantalla en blanco.
 *
 * Estas pruebas pasan al `ExerciseRenderer` (camino real del dispatcher) una
 * respuesta de OTRO tipo y afirman que el renderizador del tipo actual no lanza:
 * muestra su enunciado y sus controles. Fijan el endurecimiento defensivo.
 */

const META: Emparejar['meta'] = {
  tema: 'Convivencia',
  etiquetas: ['paz'],
  estado: 'aprobado',
};

// Respuesta de un tipo DISTINTO al del ejercicio bajo prueba (reproduce el
// render intermedio con respuesta stale).
const respuestaDeOtroTipo: Respuesta = { tipo: 'verdadero_falso', valor: null };

describe('ExerciseRenderer — robustez ante respuesta de tipo equivocado', () => {
  it('emparejar no crashea y muestra enunciado + selects', () => {
    const ejercicio: Emparejar = {
      id: 'emp-1',
      tipo: 'emparejar',
      enunciado: 'Empareja cada actitud con lo que produce.',
      pares: [
        { izquierda: 'Escuchar', derecha: 'Entendimiento' },
        { izquierda: 'Insultar', derecha: 'Más conflicto' },
      ],
      retroalimentacion: 'Las actitudes de respeto construyen convivencia.',
      meta: META,
    };

    expect(() =>
      render(
        <ExerciseRenderer
          ejercicio={ejercicio}
          respuesta={respuestaDeOtroTipo}
          onChange={vi.fn()}
          deshabilitado={false}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText(/Empareja cada actitud/)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('ordenar no crashea y muestra enunciado + controles', () => {
    const ejercicio: Ordenar = {
      id: 'ord-1',
      tipo: 'ordenar',
      enunciado: 'Ordena los pasos de la resolución pacífica.',
      elementos: [
        { id: 'p1', texto: 'Escuchar', orden: 1 },
        { id: 'p2', texto: 'Acordar', orden: 2 },
      ],
      retroalimentacion: 'Primero escuchar, luego acordar.',
      meta: META,
    };

    expect(() =>
      render(
        <ExerciseRenderer
          ejercicio={ejercicio}
          respuesta={respuestaDeOtroTipo}
          onChange={vi.fn()}
          deshabilitado={false}
        />,
      ),
    ).not.toThrow();

    // Con ordenIds undefined no se puede renderizar la lista, pero NO debe
    // lanzar: el enunciado sigue visible (defensa en profundidad).
    expect(screen.getByText(/Ordena los pasos/)).toBeInTheDocument();
  });

  it('completar no crashea y muestra enunciado + selects', () => {
    const ejercicio: Completar = {
      id: 'comp-1',
      tipo: 'completar',
      enunciado: 'Completa la frase.',
      texto: 'Lo mejor es ___ a la otra persona.',
      huecos: [{ id: 'h1', opciones: ['escuchar', 'ignorar'], correcta: 'escuchar' }],
      retroalimentacion: 'Escuchar es la base.',
      meta: META,
    };

    expect(() =>
      render(
        <ExerciseRenderer
          ejercicio={ejercicio}
          respuesta={respuestaDeOtroTipo}
          onChange={vi.fn()}
          deshabilitado={false}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText(/Completa la frase/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Hueco 1' })).toBeInTheDocument();
  });

  it('analisis_fuente no crashea y muestra enunciado + opciones', () => {
    const ejercicio: AnalisisFuente = {
      id: 'af-1',
      tipo: 'analisis_fuente',
      enunciado: 'Lee la fuente y responde.',
      recurso: { clase: 'texto', contenido: 'Un testimonio de ejemplo.' },
      preguntas: [
        {
          id: 'q1',
          pregunta: '¿Qué hicieron?',
          opciones: [
            { id: 'a', texto: 'Un acuerdo', esCorrecta: true, retro: 'Correcto.' },
            { id: 'b', texto: 'Nada', esCorrecta: false, retro: 'Casi.' },
          ],
        },
      ],
      retroalimentacion: 'Analizar fuentes ayuda a entender.',
      meta: {
        tema: 'Fuentes',
        etiquetas: ['paz'],
        estado: 'aprobado',
        fuente: { titulo: 'Testimonio Bacatá', autor: 'Material propio' },
      },
    };

    expect(() =>
      render(
        <ExerciseRenderer
          ejercicio={ejercicio}
          respuesta={respuestaDeOtroTipo}
          onChange={vi.fn()}
          deshabilitado={false}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText(/Lee la fuente/)).toBeInTheDocument();
    expect(screen.getByLabelText('Un acuerdo')).toBeInTheDocument();
  });
});
