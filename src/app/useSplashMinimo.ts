import { useEffect, useState } from 'react';

/**
 * Duración mínima (en ms) que el splash de arranque de Bacatá permanece
 * visible, aunque la sesión resuelva antes. 2.3 s es el valor acordado para que
 * el mensaje de marca ("Bacatá" / "Aprende jugando") alcance a leerse sin pasar
 * demasiado rápido. Se exporta como constante para reutilizarla en las pruebas
 * sin acoplar el número mágico.
 */
export const SPLASH_MIN_MS = 2300;

/**
 * Hook de "mínimo de splash": garantiza que el splash de arranque se vea al
 * menos `ms` milisegundos. Arranca devolviendo `false` (mínimo no cumplido) y
 * pasa a `true` tras `ms` vía `setTimeout`. El temporizador se limpia al
 * desmontar (sin fugas). Es solo temporización de UI local: no toca la sesión,
 * no hace red y funciona offline.
 */
export function useSplashMinimo(ms: number = SPLASH_MIN_MS): boolean {
  const [cumplido, setCumplido] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setCumplido(true), ms);
    return () => clearTimeout(id);
  }, [ms]);

  return cumplido;
}
