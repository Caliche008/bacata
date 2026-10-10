import { useEffect, useState } from 'react';

/**
 * Estado de conexión del navegador (R5.7). Devuelve `true` si hay conexión.
 *
 * Inicializa desde `navigator.onLine` y se suscribe a los eventos `online` /
 * `offline`, limpiando el listener al desmontar. Defensivo: si `navigator` no
 * existe (SSR/pruebas), asume que está en línea para no bloquear la app.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') {
      return true;
    }
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}
