import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadBundledCourses } from '../../content/loader';
import { getCursoPorGrado, listarUnidades } from '../../content';
import type { Curso } from '../../content';
import { construirRuta } from '../lessons';
import { UnidadesClase } from './UnidadesClase';

/**
 * Pruebas de activar/desactivar unidades (R6.3, R6.4). Al ocultar una unidad, el
 * servicio recibe la lista de ids SIN esa unidad; y pasar esa lista a
 * `construirRuta` confirma que la unidad desactivada no aparece en la ruta del
 * estudiante.
 */

function cursoDe6(): Curso {
  const { index } = loadBundledCourses();
  const curso = getCursoPorGrado(index, 6);
  if (!curso) {
    throw new Error('No se encontró el curso de 6°.');
  }
  return curso;
}

describe('UnidadesClase', () => {
  it('cada unidad expone un switch con su estado anunciado', () => {
    const curso = cursoDe6();
    render(
      <UnidadesClase
        curso={curso}
        unidadesActivas={[]}
        mostrarTodasPorDefecto
        onCambiar={() => {}}
      />,
    );
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(listarUnidades(curso).length);
    // Con fallback (todas) cada switch está "activa".
    switches.forEach((s) => expect(s).toHaveAttribute('aria-checked', 'true'));
  });

  it('ocultar una unidad envía la lista de ids SIN esa unidad', async () => {
    const user = userEvent.setup();
    const curso = cursoDe6();
    const unidades = listarUnidades(curso);
    const onCambiar = vi.fn();

    render(
      <UnidadesClase
        curso={curso}
        unidadesActivas={[]}
        mostrarTodasPorDefecto
        onCambiar={onCambiar}
      />,
    );

    // Oculta la primera unidad.
    await user.click(screen.getAllByRole('switch')[0]);

    const idsEsperados = unidades.slice(1).map((u) => u.id);
    expect(onCambiar).toHaveBeenCalledWith(idsEsperados);

    // La lista enviada, al pasarla a construirRuta, oculta esa unidad.
    const idsGuardados = onCambiar.mock.calls[0][0] as string[];
    const ruta = construirRuta(curso, idsGuardados, []);
    expect(ruta.unidades.some((u) => u.id === unidades[0].id)).toBe(false);
    expect(ruta.unidades.length).toBe(unidades.length - 1);
  });
});
