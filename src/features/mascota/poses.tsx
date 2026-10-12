/**
 * Poses de la mascota de Bacatá como ilustraciones (arte final).
 *
 * Cada pose es un <img> que apunta a su PNG en `public/mascota/`. El personaje
 * es un perro andino color miel con mochila de motivos muiscas y collar dorado
 * (ver brand.md); nunca se burla del error (la pose "animando" es alentadora).
 *
 * Accesibilidad: cada imagen es decorativa por defecto. El componente `Mascota`
 * decide: si pasa `title`, se usa como `alt` (imagen informativa); si no, el
 * `alt` queda vacío y la imagen se oculta al lector de pantalla (`aria-hidden`),
 * porque el significado viaja en el mensaje de texto que la acompaña.
 *
 * Las imágenes viven en `public/`, así que se referencian con una URL relativa
 * a la base del sitio (`import.meta.env.BASE_URL`) para que funcionen tanto en
 * local ("/") como en GitHub Pages ("/bacata/").
 *
 * Este archivo exporta ÚNICAMENTE componentes (los tipos viven en
 * `pose-types.ts`) para que Fast Refresh funcione sin advertencias.
 */

import type { FC } from 'react';
import type { PoseProps } from './pose-types';

/** Carpeta pública de las ilustraciones, relativa a la base del sitio. */
const ART_BASE = `${import.meta.env.BASE_URL}mascota/`;

/**
 * Envoltura común: una imagen de pose. Decorativa salvo que reciba `title`
 * (en cuyo caso se usa como texto alternativo y la imagen es informativa).
 */
function PoseImg({
  src,
  title,
  className,
}: PoseProps & { src: string }) {
  const decorative = !title;
  return (
    <img
      className={className}
      src={`${ART_BASE}${src}`}
      alt={decorative ? '' : title}
      aria-hidden={decorative ? true : undefined}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  );
}

export const Feliz: FC<PoseProps> = (props) => (
  <PoseImg {...props} src="feliz.png" />
);

export const Pensando: FC<PoseProps> = (props) => (
  <PoseImg {...props} src="pensando.png" />
);

export const Celebrando: FC<PoseProps> = (props) => (
  <PoseImg {...props} src="celebrando.png" />
);

export const Animando: FC<PoseProps> = (props) => (
  <PoseImg {...props} src="animando.png" />
);

export const Saludando: FC<PoseProps> = (props) => (
  <PoseImg {...props} src="saludando.png" />
);

export const Durmiendo: FC<PoseProps> = (props) => (
  <PoseImg {...props} src="durmiendo.png" />
);
