import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cursoSchema, type Ejercicio, type Leccion } from '../../content';
import { closeDb, resetDb } from '../../lib/storage';
import LeccionDetalle from './LeccionDetalle';

/**
 * Prueba de integración del flujo completo (habría atrapado el bug reportado).
 *
 * Monta el `LeccionDetalle` REAL con el contenido semilla REAL y recorre la
 * lección 1 de cada grado por los 7 tipos en orden (opcion_multiple →
 * verdadero_falso → emparejar → ordenar → completar → dilema → analisis_fuente),
 * respondiendo correctamente cada ejercicio y pulsando "Siguiente"/"Terminar".
 * Incluye la aserción explícita del paso 2→3 (al entrar a "emparejar" la pantalla
 * NO queda en blanco), que es la regresión que se reportó.
 */

function cargarLeccion1(archivo: string): Leccion {
  const crudo = JSON.parse(
    readFileSync(join(process.cwd(), 'content', 'cursos', archivo), 'utf8'),
  ) as unknown;
  const curso = cursoSchema.parse(crudo);
  const leccion = curso.unidades[0]?.lecciones[0];
  if (!leccion) {
    throw new Error(`No se encontró la lección 1 en ${archivo}`);
  }
  return leccion;
}

/**
 * Responde CORRECTAMENTE el ejercicio actual según su tipo. No pulsa "Responder":
 * solo deja la respuesta lista para evaluar.
 */
async function responderCorrecto(
  user: ReturnType<typeof userEvent.setup>,
  ejercicio: Ejercicio,
): Promise<void> {
  switch (ejercicio.tipo) {
    case 'opcion_multiple': {
      const correcta = ejercicio.opciones.find((o) => o.esCorrecta);
      if (!correcta) throw new Error('opcion_multiple sin opción correcta');
      await user.click(await screen.findByLabelText(correcta.texto));
      return;
    }
    case 'verdadero_falso': {
      await user.click(
        await screen.findByLabelText(ejercicio.respuestaCorrecta ? 'Verdadero' : 'Falso'),
      );
      return;
    }
    case 'emparejar': {
      // Cada izquierda i empareja con la derecha de su MISMO par (índice i). El
      // `<select>` muestra el texto de la derecha; seleccionar por ese texto fija
      // el índice original correcto (el barajado es solo de presentación).
      const selects = await screen.findAllByRole('combobox');
      for (let i = 0; i < ejercicio.pares.length; i += 1) {
        await user.selectOptions(selects[i], ejercicio.pares[i].derecha);
      }
      return;
    }
    case 'ordenar': {
      // Orden correcto = elementos ordenados por `orden`. Se lleva la lista al
      // objetivo con los botones "Subir"/"Bajar" (orden-selección accesible).
      const objetivo = [...ejercicio.elementos]
        .sort((a, b) => a.orden - b.orden)
        .map((e) => e.texto);
      for (let destino = 0; destino < objetivo.length; destino += 1) {
        // Reconsultar la lista en cada paso (el DOM se recompone tras mover).
        let items = screen
          .getAllByRole('listitem')
          .filter((li) => li.classList.contains('bc-ordenar__item'));
        let actual = items.findIndex(
          (li) =>
            li.querySelector('.bc-ordenar__texto')?.textContent?.trim() === objetivo[destino],
        );
        while (actual > destino) {
          const li = items[actual];
          await user.click(
            within(li).getByRole('button', { name: `Subir: ${objetivo[destino]}` }),
          );
          items = screen
            .getAllByRole('listitem')
            .filter((el) => el.classList.contains('bc-ordenar__item'));
          actual = items.findIndex(
            (el) =>
              el.querySelector('.bc-ordenar__texto')?.textContent?.trim() === objetivo[destino],
          );
        }
      }
      return;
    }
    case 'completar': {
      for (let i = 0; i < ejercicio.huecos.length; i += 1) {
        const hueco = ejercicio.huecos[i];
        const select = await screen.findByRole('combobox', { name: `Hueco ${i + 1}` });
        await user.selectOptions(select, hueco.correcta);
      }
      return;
    }
    case 'dilema': {
      // Sin veredicto: cualquier opción permite avanzar. Se elige la primera.
      await user.click(await screen.findByLabelText(ejercicio.opciones[0].texto));
      return;
    }
    case 'analisis_fuente': {
      for (const pregunta of ejercicio.preguntas) {
        const correcta = pregunta.opciones.find((o) => o.esCorrecta);
        if (!correcta) throw new Error('analisis_fuente con pregunta sin opción correcta');
        await user.click(await screen.findByLabelText(correcta.texto));
      }
      return;
    }
    default: {
      const _exhaustivo: never = ejercicio;
      return _exhaustivo;
    }
  }
}

async function recorrerLeccion(leccion: Leccion): Promise<ReturnType<typeof vi.fn>> {
  const user = userEvent.setup();
  const onCompletada = vi.fn();
  render(
    <LeccionDetalle
      leccion={leccion}
      estudianteId={`est-${leccion.id}`}
      onVolver={vi.fn()}
      onCompletada={onCompletada}
    />,
  );

  const total = leccion.ejercicios.length;
  for (let i = 0; i < total; i += 1) {
    const ejercicio = leccion.ejercicios[i];
    // (a) El enunciado aparece antes de responder (nunca pantalla en blanco).
    expect(await screen.findByText(ejercicio.enunciado)).toBeInTheDocument();

    await responderCorrecto(user, ejercicio);
    await user.click(screen.getByRole('button', { name: 'Responder' }));

    const avanzar = i < total - 1 ? 'Siguiente' : 'Terminar';
    await user.click(await screen.findByRole('button', { name: avanzar }));
  }

  await waitFor(() => expect(onCompletada).toHaveBeenCalled());
  return onCompletada;
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('Recorrido completo de la lección 1 por los 7 tipos', () => {
  it('6°: el paso verdadero_falso → emparejar NO deja pantalla en blanco (regresión)', async () => {
    const user = userEvent.setup();
    const leccion = cargarLeccion1('grado-6.json');
    render(
      <LeccionDetalle
        leccion={leccion}
        estudianteId="est-regresion-6"
        onVolver={vi.fn()}
        onCompletada={vi.fn()}
      />,
    );

    // Ejercicio 1 (opcion_multiple) → responder y avanzar.
    await responderCorrecto(user, leccion.ejercicios[0]);
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    await user.click(await screen.findByRole('button', { name: 'Siguiente' }));

    // Ejercicio 2 (verdadero_falso) → responder y avanzar al 3 (emparejar).
    await responderCorrecto(user, leccion.ejercicios[1]);
    await user.click(screen.getByRole('button', { name: 'Responder' }));
    await user.click(await screen.findByRole('button', { name: 'Siguiente' }));

    // Antes del fix, aquí la pantalla quedaba en blanco (crash de emparejar).
    expect(await screen.findByText(/Empareja cada actitud/)).toBeInTheDocument();
  });

  it('6°: completa la lección 1 de principio a fin', async () => {
    const leccion = cargarLeccion1('grado-6.json');
    const onCompletada = await recorrerLeccion(leccion);
    expect(onCompletada).toHaveBeenCalledTimes(1);
  });

  it('7°: completa la lección 1 de principio a fin', async () => {
    const leccion = cargarLeccion1('grado-7.json');
    const onCompletada = await recorrerLeccion(leccion);
    expect(onCompletada).toHaveBeenCalledTimes(1);
  });
});
