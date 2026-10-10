import { useEffect, useRef } from 'react';
import { Button } from '../../components';
import { BorrarMisDatos } from './BorrarMisDatos';
import { POLITICA_PRIVACIDAD, type SeccionPolitica } from './privacy-policy';
import './privacy.css';

export interface PoliticaPrivacidadProps {
  /** Cierra la vista de política y vuelve a la pantalla anterior. */
  onCerrar: () => void;
}

/**
 * Presentación de la política de privacidad (R8.4, R8.5, R8.8).
 *
 * Es un componente PURO de presentación: recibe el texto desde los datos
 * tipados (`POLITICA_PRIVACIDAD`) y no habla con el almacenamiento. Renderiza
 * una jerarquía de encabezados correcta (`h1` del documento + `h2` por sección)
 * para que un lector de pantalla pueda navegar por secciones; el aviso de
 * borrador va en un `role="note"` destacado por texto (no solo color).
 *
 * Accesibilidad: `main` con `aria-labelledby`, foco inicial en el encabezado,
 * botón "Volver" alcanzable por teclado y con objetivo táctil del tema.
 */
export function PoliticaPrivacidad({ onCerrar }: PoliticaPrivacidadProps) {
  const tituloRef = useRef<HTMLHeadingElement>(null);

  // Lleva el foco al título al abrir la vista para orientar al lector de
  // pantalla, sin robarlo de forma brusca (patrón del resto de vistas).
  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  return (
    <main className="bc-privacy" aria-labelledby="bc-privacy-titulo">
      <article className="bc-privacy__doc">
        <h1
          id="bc-privacy-titulo"
          className="bc-privacy__titulo"
          tabIndex={-1}
          ref={tituloRef}
        >
          {POLITICA_PRIVACIDAD.titulo}
        </h1>

        <p className="bc-privacy__actualizado">{POLITICA_PRIVACIDAD.actualizado}</p>

        {/* Aviso de borrador: texto + ícono + color (no solo color). */}
        <p className="bc-privacy__aviso" role="note">
          <span className="bc-privacy__aviso-etiqueta" aria-hidden="true">
            ⚠
          </span>
          <span>
            <strong>Aviso:</strong> {POLITICA_PRIVACIDAD.avisoBorrador}
          </span>
        </p>

        <p className="bc-privacy__intro">{POLITICA_PRIVACIDAD.intro}</p>

        {POLITICA_PRIVACIDAD.secciones.map((seccion) => (
          <Seccion key={seccion.id} seccion={seccion} />
        ))}

        {/* Borrado de datos del propio estudiante (R8.3). Solo aparece si hay
            sesión activa; sin perfil, `BorrarMisDatos` no renderiza nada. */}
        <div className="bc-privacy__borrado">
          <BorrarMisDatos />
        </div>

        <div className="bc-privacy__acciones">
          <Button variant="primary" onClick={onCerrar}>
            Volver
          </Button>
        </div>
      </article>
    </main>
  );
}

/** Renderiza una sección con su encabezado (`h2`) y sus bloques. */
function Seccion({ seccion }: { seccion: SeccionPolitica }) {
  return (
    <section className="bc-privacy__seccion">
      <h2 className="bc-privacy__seccion-titulo">{seccion.titulo}</h2>
      {seccion.bloques.map((bloque, indice) =>
        bloque.tipo === 'parrafo' ? (
          <p key={indice}>{bloque.texto}</p>
        ) : (
          <ul key={indice} className="bc-privacy__lista">
            {bloque.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </section>
  );
}
