import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PoliticaPrivacidad } from './PoliticaPrivacidad';
import { AVISO_BORRADOR } from './privacy-policy';

/**
 * Pruebas de la vista de política de privacidad (R8.4, R8.5, R8.8): estructura
 * accesible (encabezados), presencia de las secciones y avisos clave.
 *
 * `BorrarMisDatos` usa `useSession`; aquí lo mockeamos sin perfil para que no
 * renderice nada (su propio flujo se prueba en `BorrarMisDatos.test.tsx`).
 */
vi.mock('../auth', () => ({
  useSession: () => ({
    perfil: null,
    cargando: false,
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
  }),
}));

describe('PoliticaPrivacidad', () => {
  it('renderiza con estructura accesible: un h1 y varias secciones con h2', () => {
    render(<PoliticaPrivacidad onCerrar={vi.fn()} />);

    const encabezadoPrincipal = screen.getByRole('heading', { level: 1 });
    expect(encabezadoPrincipal).toHaveTextContent('Política de privacidad de Bacatá');

    const secciones = screen.getAllByRole('heading', { level: 2 });
    expect(secciones.length).toBeGreaterThanOrEqual(5);

    // La región principal está etiquetada por el título.
    expect(screen.getByRole('main')).toHaveAttribute(
      'aria-labelledby',
      'bc-privacy-titulo',
    );
  });

  it('muestra el aviso literal de que no es asesoría jurídica', () => {
    render(<PoliticaPrivacidad onCerrar={vi.fn()} />);

    const aviso = screen.getByRole('note');
    expect(aviso).toHaveTextContent(AVISO_BORRADOR);
  });

  it('cubre las secciones clave: Ley 1581, qué NO se recoge y el plazo por definir', () => {
    render(<PoliticaPrivacidad onCerrar={vi.fn()} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Ley 1581 de 2012/i }),
    ).toBeInTheDocument();

    const noRecoge = screen.getByRole('heading', {
      level: 2,
      name: /qué datos NO se recogen/i,
    });
    expect(noRecoge).toBeInTheDocument();

    // No se recoge correo ni ubicación (R8.1).
    expect(screen.getByText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/Ubicación/i)).toBeInTheDocument();

    // Plazo de conservación "por definir con asesor jurídico" (R8.8), sin número.
    expect(
      screen.getByText(/por definir con un asesor jurídico/i),
    ).toBeInTheDocument();
  });

  it('explica el consentimiento del acudiente gestionado fuera de la app (R8.5)', () => {
    render(<PoliticaPrivacidad onCerrar={vi.fn()} />);

    const seccion = screen.getByRole('heading', {
      level: 2,
      name: /Consentimiento del acudiente/i,
    });
    expect(seccion).toBeInTheDocument();
    expect(screen.getByText(/por fuera de la app/i)).toBeInTheDocument();
  });

  it('el botón "Volver" invoca onCerrar', async () => {
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<PoliticaPrivacidad onCerrar={onCerrar} />);

    await user.click(screen.getByRole('button', { name: 'Volver' }));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('no muestra el borrado del estudiante cuando no hay sesión', () => {
    render(<PoliticaPrivacidad onCerrar={vi.fn()} />);
    // `BorrarMisDatos` no renderiza su botón sin perfil activo.
    expect(
      screen.queryByRole('button', { name: 'Borrar mis datos' }),
    ).toBeNull();
    // El resto del documento sí está presente.
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
