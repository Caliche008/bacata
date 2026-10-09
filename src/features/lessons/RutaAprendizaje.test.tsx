import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Curso } from '../../content';
import type { PerfilEstudiante } from '../../lib/storage';
import type { RutaVista, UnidadVista } from './path';
import { RutaAprendizaje } from './RutaAprendizaje';

/**
 * Pruebas de presentación/integración de la ruta (caso g del brief): estados
 * por ícono + texto, lección bloqueada NO iniciable, navegación al placeholder
 * de lección, porcentaje con ProgressBar, unidad vacía "Próximamente" y
 * celebración con la mascota. Se mockean `useRuta` y `useSession` para aislar la
 * presentación de la carga de datos (ya cubierta por `path.test.ts`).
 */

const perfil: PerfilEstudiante = {
  id: 'est-1',
  apodo: 'Explorador',
  codigoClase: 'ABC234',
  grado: 6,
  creadoEn: '2024-01-01T00:00:00.000Z',
};

const cerrarSesion = vi.fn();

vi.mock('../auth', () => ({
  useSession: () => ({
    perfil,
    cargando: false,
    iniciarSesion: vi.fn(),
    cerrarSesion,
  }),
}));

let rutaMock: RutaVista | null = null;
let cursoMock: Curso | null = null;

vi.mock('./useRuta', () => ({
  useRuta: () => ({
    cargando: false,
    error: null,
    curso: cursoMock,
    ruta: rutaMock,
    recargar: vi.fn(),
  }),
}));

function unidad(partial: Partial<UnidadVista> & Pick<UnidadVista, 'id'>): UnidadVista {
  return {
    titulo: `Unidad ${partial.id}`,
    descripcion: 'Descripción',
    orden: 1,
    ejePaz: true,
    vacia: false,
    completada: false,
    porcentaje: 0,
    totalLecciones: 0,
    completadas: 0,
    lecciones: [],
    ...partial,
  };
}

const cursoBase: Curso = {
  id: 'c',
  grado: 6,
  area: 'ciencias_sociales',
  titulo: 'Curso',
  descripcion: 'Desc',
  version: '1.0.0',
  unidades: [
    {
      id: 'u1',
      titulo: 'Unidad u1',
      descripcion: 'Descripción',
      orden: 1,
      objetivos: [],
      ejePaz: true,
      catedraPaz: { tematicas: ['Convivencia'], como: 'Transversal' },
      lecciones: [
        {
          id: 'l1',
          titulo: 'Primera lección',
          objetivoAprendizaje: 'Entender la convivencia',
          competencia: 'Competencia',
          orden: 1,
          ejercicios: [],
        },
      ],
    },
  ],
};

beforeEach(() => {
  cerrarSesion.mockClear();
  cursoMock = cursoBase;
  rutaMock = {
    unidades: [
      unidad({
        id: 'u1',
        titulo: 'Unidad u1',
        porcentaje: 50,
        totalLecciones: 2,
        completadas: 1,
        lecciones: [
          { id: 'l1', titulo: 'Primera lección', orden: 1, estado: 'disponible' },
          { id: 'l2', titulo: 'Segunda lección', orden: 2, estado: 'bloqueada' },
        ],
      }),
      unidad({ id: 'u2', titulo: 'Unidad u2', vacia: true, orden: 2 }),
    ],
  };
});

describe('RutaAprendizaje — presentación (g)', () => {
  it('muestra el saludo con el apodo y las unidades en orden', () => {
    render(<RutaAprendizaje />);
    expect(
      screen.getByRole('heading', { name: '¡Hola, Explorador!' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Unidad u1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Unidad u2' })).toBeInTheDocument();
  });

  it('comunica el estado por texto (no solo color): "Empezar", "Bloqueada"', () => {
    render(<RutaAprendizaje />);
    expect(screen.getByText('Empezar')).toBeInTheDocument();
    expect(screen.getByText('Bloqueada')).toBeInTheDocument();
  });

  it('una lección bloqueada NO es iniciable (botón deshabilitado)', async () => {
    const user = userEvent.setup();
    render(<RutaAprendizaje />);

    const bloqueada = screen.getByRole('button', { name: /Segunda lección/ });
    expect(bloqueada).toBeDisabled();

    await user.click(bloqueada);
    // Sigue en la ruta: el placeholder de lección no aparece.
    expect(screen.queryByText('Los ejercicios llegan pronto.')).toBeNull();
  });

  it('tocar una lección disponible abre el placeholder de lección', async () => {
    const user = userEvent.setup();
    render(<RutaAprendizaje />);

    await user.click(screen.getByRole('button', { name: /Primera lección/ }));

    await waitFor(() =>
      expect(screen.getByText('Los ejercicios llegan pronto.')).toBeInTheDocument(),
    );
    expect(screen.getByText(/Entender la convivencia/)).toBeInTheDocument();
  });

  it('muestra el porcentaje por unidad con ProgressBar accesible', () => {
    render(<RutaAprendizaje />);
    const barras = screen.getAllByRole('progressbar');
    expect(barras[0]).toHaveAttribute('aria-valuenow', '50');
  });

  it('una unidad vacía aparece como "Próximamente"', () => {
    render(<RutaAprendizaje />);
    expect(screen.getByText(/Próximamente/)).toBeInTheDocument();
  });

  it('muestra la Cátedra de la Paz como insignia dentro de la unidad', () => {
    render(<RutaAprendizaje />);
    expect(screen.getAllByText('Cátedra de la Paz').length).toBeGreaterThan(0);
  });
});

describe('RutaAprendizaje — celebración con mascota (g)', () => {
  it('al pasar una unidad a completada muestra la mascota en pose celebrando', async () => {
    const { container, rerender } = render(<RutaAprendizaje />);
    // Primer render: sin unidades completadas; no hay celebración.
    expect(container.querySelector('[data-pose="celebrando"]')).toBeNull();

    // Nueva ruta con la unidad u1 completada: debe dispararse la celebración.
    rutaMock = {
      unidades: [
        unidad({
          id: 'u1',
          titulo: 'Unidad u1',
          completada: true,
          porcentaje: 100,
          totalLecciones: 1,
          completadas: 1,
          lecciones: [{ id: 'l1', titulo: 'Primera lección', orden: 1, estado: 'completada' }],
        }),
      ],
    };
    rerender(<RutaAprendizaje />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(container.querySelector('[data-pose="celebrando"]')).not.toBeNull();
    });
    expect(screen.getByText(/¡Completaste Unidad u1!/)).toBeInTheDocument();
  });
});
