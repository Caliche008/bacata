import { useEffect, useState } from 'react';
import {
  getStorageEstimate,
  isStoragePersisted,
  requestPersistentStorage,
} from '../lib/storage';

/**
 * Umbral de espacio libre por debajo del cual avisamos al estudiante (R5.6).
 * El contenido empaquetado del MVP es pequeño; 50 MB libres es un margen holgado
 * para el precache + progreso en IndexedDB sin alarmar sin motivo.
 */
export const LOW_SPACE_THRESHOLD_BYTES = 50 * 1024 * 1024;

export interface StoragePersistenceState {
  /** El navegador concedió almacenamiento persistente. */
  persisted: boolean;
  /** Queda poco espacio libre, o se denegó la persistencia. */
  lowSpace: boolean;
  /** La Storage API no está disponible (no se puede evaluar). */
  apiUnavailable: boolean;
  /** La evaluación inicial sigue en curso. */
  checking: boolean;
}

const INITIAL_STATE: StoragePersistenceState = {
  persisted: false,
  lowSpace: false,
  apiUnavailable: false,
  checking: true,
};

/**
 * Al montar, solicita almacenamiento persistente (reutilizando el helper de
 * `lib/storage`, sin duplicar) y evalúa la cuota para decidir si avisar al
 * estudiante (R5.6).
 *
 * - `apiUnavailable`: si `estimate()` no existe, no se puede evaluar la cuota;
 *   no se muestra ningún aviso ruidoso.
 * - `lowSpace`: cuota libre por debajo del umbral, o persistencia denegada por
 *   el navegador.
 *
 * Defensivo de principio a fin: ninguno de los helpers lanza.
 */
export function useStoragePersistence(): StoragePersistenceState {
  const [state, setState] = useState<StoragePersistenceState>(INITIAL_STATE);

  useEffect(() => {
    let active = true;

    async function evaluate(): Promise<void> {
      // Pedir persistencia (idempotente): el navegador decide concederla.
      const granted = await requestPersistentStorage();
      const persisted = granted || (await isStoragePersisted());
      const estimate = await getStorageEstimate();

      if (!active) {
        return;
      }

      if (estimate === null) {
        setState({
          persisted,
          lowSpace: false,
          apiUnavailable: true,
          checking: false,
        });
        return;
      }

      const free = Math.max(0, estimate.quota - estimate.usage);
      const lowSpace = !persisted || free < LOW_SPACE_THRESHOLD_BYTES;

      setState({
        persisted,
        lowSpace,
        apiUnavailable: false,
        checking: false,
      });
    }

    void evaluate();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
