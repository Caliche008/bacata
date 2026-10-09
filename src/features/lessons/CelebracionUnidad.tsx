import { useEffect, useRef } from 'react';
import { Button } from '../../components';
import { Mascota, getMomento } from '../../features/mascota';

/**
 * Celebración breve al completar una unidad (R2.7, R15.1): diálogo accesible
 * (`role="dialog"`, `aria-modal`) con la mascota en pose "celebrando" y
 * microcopy de marca (tono Bacatá). Da protagonismo a la mascota en un hito
 * pedagógico real (completar una unidad), no una métrica vacía.
 *
 * Accesibilidad: al abrir, el foco va al botón "Seguir"; `Escape` cierra; el
 * foco queda contenido mientras el diálogo está abierto. El manejo de teclado
 * se adjunta por `addEventListener` sobre el nodo del diálogo (evita colgar un
 * listener en un elemento no interactivo en el JSX). La animación de la mascota
 * respeta `prefers-reduced-motion` (prop `animated` + CSS global).
 */

export interface CelebracionUnidadProps {
  tituloUnidad: string;
  onCerrar: () => void;
}

export function CelebracionUnidad({ tituloUnidad, onCerrar }: CelebracionUnidadProps) {
  const dialogoRef = useRef<HTMLDivElement>(null);
  const acierto = getMomento('acierto');

  useEffect(() => {
    const dialogo = dialogoRef.current;
    const boton = dialogo?.querySelector<HTMLButtonElement>('button');
    // Enfoca el único control del diálogo al abrir.
    boton?.focus();

    const onKeyDown = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        onCerrar();
        return;
      }
      if (evento.key === 'Tab' && boton) {
        // Contiene el foco: solo hay un control (Seguir), así que lo retenemos.
        evento.preventDefault();
        boton.focus();
      }
    };

    dialogo?.addEventListener('keydown', onKeyDown);
    return () => dialogo?.removeEventListener('keydown', onKeyDown);
  }, [onCerrar]);

  return (
    <div className="bc-celebracion__overlay">
      <div
        ref={dialogoRef}
        className="bc-celebracion"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bc-celebracion-titulo"
      >
        <Mascota pose="celebrando" size="lg" message={acierto.mensaje} animated />
        <h2 id="bc-celebracion-titulo" className="bc-celebracion__titulo">
          ¡Completaste {tituloUnidad}!
        </h2>
        <p className="bc-celebracion__texto">
          Entender el pasado nos ayuda a convivir mejor hoy. Sigue así.
        </p>
        <Button variant="primary" onClick={onCerrar}>
          Seguir
        </Button>
      </div>
    </div>
  );
}
