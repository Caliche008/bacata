import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { closeDb, resetDb } from '../../../lib/storage';
import { EditorContenido } from './EditorContenido';

/**
 * Pruebas del shell `EditorContenido`:
 * - importar un JSON inválido avisa con `role="alert"` sin romper;
 * - exportar un borrador inválido (recién creado, vacío) no descarga y avisa;
 * - deja clara la nota de que los borradores son locales.
 *
 * Usa `fake-indexeddb` (el hook `useEditorContenido` persiste el borrador) y
 * simula `URL.createObjectURL` (jsdom no lo implementa).
 */

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
  vi.restoreAllMocks();
});

describe('EditorContenido', () => {
  it('muestra la nota de que los borradores son locales', async () => {
    render(<EditorContenido />);
    expect(await screen.findByText(/los borradores son locales/i)).toBeInTheDocument();
  });

  it('importar un JSON inválido avisa con role="alert" sin romper', async () => {
    render(<EditorContenido />);
    await screen.findByText(/los borradores son locales/i);

    const input = screen.getByLabelText(
      'Importar curso desde un archivo JSON',
    ) as HTMLInputElement;
    const contenido = 'esto no es json {';
    const archivo = new File([contenido], 'curso.json', { type: 'application/json' });
    // jsdom no implementa `Blob.text()` (sí existe en el navegador), así que lo
    // proveemos para esta prueba sin alterar el componente, que usa el estándar.
    Object.defineProperty(archivo, 'text', { value: () => Promise.resolve(contenido) });
    // `fireEvent.change` dispara el onChange del input (que puede estar oculto a
    // la vista) de forma determinista con el archivo seleccionado.
    fireEvent.change(input, { target: { files: [archivo] } });

    // El aviso de importación es un `role="alert"` con este mensaje concreto
    // (hay otras alertas de validación de campos vacíos; filtramos por texto).
    const aviso = await screen.findByText(/no pudimos importar/i);
    expect(aviso.closest('[role="alert"]')).not.toBeNull();
    // El editor sigue en pie: su encabezado permanece.
    expect(screen.getByRole('heading', { name: 'Editor de contenido' })).toBeInTheDocument();
  });

  it('exportar un borrador vacío (inválido) no descarga y avisa', async () => {
    const user = userEvent.setup();
    const createUrl = vi.fn(() => 'blob:fake');
    vi.stubGlobal('URL', { ...URL, createObjectURL: createUrl, revokeObjectURL: vi.fn() });

    render(<EditorContenido />);
    await screen.findByText(/los borradores son locales/i);

    // El botón de exportar está deshabilitado (`disabled={!curso}`) hasta que el
    // borrador termina de cargar desde IndexedDB. Esperamos a que se habilite
    // para no hacer un clic sin efecto (origen de intermitencia en la prueba).
    const botonExportar = screen.getByRole('button', { name: 'Exportar curso (JSON)' });
    await waitFor(() => expect(botonExportar).toBeEnabled());

    // El curso recién creado está vacío (sin título ni unidades): no valida.
    await user.click(botonExportar);

    const aviso = await screen.findByText(/no pudimos exportar/i);
    expect(aviso.closest('[role="alert"]')).not.toBeNull();
    expect(createUrl).not.toHaveBeenCalled();
  });
});
