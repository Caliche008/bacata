import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoragePersistenceNotice } from './StoragePersistenceNotice';
import { LOW_SPACE_THRESHOLD_BYTES } from './useStoragePersistence';

/**
 * Pruebas del aviso de almacenamiento (R5.6). Muestra el aviso accesible solo
 * con poco espacio; no lo muestra con espacio suficiente ni con la API ausente.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubStorage(storage: Partial<StorageManager> | undefined): void {
  vi.stubGlobal('navigator', storage ? { onLine: true, storage } : { onLine: true });
}

describe('StoragePersistenceNotice', () => {
  it('muestra un aviso accesible cuando hay poco espacio', async () => {
    stubStorage({
      persist: () => Promise.resolve(false),
      persisted: () => Promise.resolve(false),
      estimate: () =>
        Promise.resolve({ usage: 0, quota: Math.floor(LOW_SPACE_THRESHOLD_BYTES / 2) }),
    });

    render(<StoragePersistenceNotice />);

    const aviso = await screen.findByRole('status');
    expect(aviso).toHaveTextContent(/poco espacio/i);
  });

  it('no muestra nada con espacio suficiente', async () => {
    stubStorage({
      persist: () => Promise.resolve(true),
      persisted: () => Promise.resolve(true),
      estimate: () => Promise.resolve({ usage: 0, quota: LOW_SPACE_THRESHOLD_BYTES * 4 }),
    });

    const { container } = render(<StoragePersistenceNotice />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('no muestra nada cuando la API no existe', async () => {
    stubStorage(undefined);

    const { container } = render(<StoragePersistenceNotice />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
