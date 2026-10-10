/**
 * Poses de la mascota de Bacatá como SVG inline ligeros.
 *
 * Son PLACEHOLDERS DE CALIDAD, no arte final: un perro andino color miel, con
 * orejas expresivas, ojos grandes y curiosos y un detalle dorado en el collar
 * (ver brand.md). Contornos limpios y formas redondeadas; sin símbolos
 * políticos, armas ni uniformes; nunca se burla del error.
 *
 * El mapa `poseRenderers` (pose -> componente) vive en `pose-renderers.ts` y
 * permite sustituir cada pose por arte final sin tocar a los consumidores. Cada
 * SVG es decorativo: el componente `Mascota` decide el `aria-hidden`; el
 * significado va siempre en el mensaje de texto que lo acompaña.
 *
 * Este archivo exporta ÚNICAMENTE componentes (los tipos viven en
 * `pose-types.ts`) para que Fast Refresh funcione sin advertencias.
 */

import type { FC, ReactNode } from 'react';
import type { PoseProps } from './pose-types';

/* Paleta local derivada de brand.md (coherente con los tokens). */
const FUR = '#E2A72E'; // miel/dorado
const FUR_DARK = '#C4623A'; // terracota para sombras de pelaje
const COLLAR = '#1F7A5A'; // esmeralda
const GOLD = '#E2A72E'; // detalle dorado del collar
const GOLD_DARK = '#8A5A00';
const INK = '#2B2B2B'; // contornos
const CREAM = '#FBF6EC';

/** Envoltura común: viewBox cuadrado, trazo redondeado y rol de imagen o deco. */
function Svg({
  title,
  className,
  children,
}: PoseProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

/** Cara base reutilizable: cabeza miel, orejas, hocico, collar dorado. */
function Head({ eyes }: { eyes: ReactNode }) {
  return (
    <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
      {/* Orejas expresivas */}
      <path d="M30 40 Q22 18 40 26 L46 44 Z" fill={FUR_DARK} />
      <path d="M90 40 Q98 18 80 26 L74 44 Z" fill={FUR_DARK} />
      {/* Cabeza */}
      <circle cx="60" cy="58" r="34" fill={FUR} />
      {/* Hocico */}
      <ellipse cx="60" cy="70" rx="18" ry="14" fill={CREAM} />
      <ellipse cx="60" cy="64" rx="5" ry="4" fill={INK} stroke="none" />
      {eyes}
      {/* Collar con detalle dorado */}
      <path d="M34 86 Q60 100 86 86" fill="none" stroke={COLLAR} strokeWidth="7" />
      <circle cx="60" cy="95" r="5" fill={GOLD} stroke={GOLD_DARK} />
    </g>
  );
}

const OpenEyes = (
  <g stroke="none">
    <circle cx="48" cy="54" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
    <circle cx="72" cy="54" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
    <circle cx="49" cy="55" r="3" fill={INK} />
    <circle cx="73" cy="55" r="3" fill={INK} />
  </g>
);

export const Feliz: FC<PoseProps> = (props) => (
  <Svg {...props}>
    <Head eyes={OpenEyes} />
    {/* Boca sonriente */}
    <path
      d="M52 72 Q60 80 68 72"
      fill="none"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const Pensando: FC<PoseProps> = (props) => (
  <Svg {...props}>
    <Head
      eyes={
        <g stroke="none">
          {/* Mirada hacia arriba (curiosa) */}
          <circle cx="48" cy="54" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
          <circle cx="72" cy="54" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
          <circle cx="49" cy="51" r="3" fill={INK} />
          <circle cx="73" cy="51" r="3" fill={INK} />
        </g>
      }
    />
    {/* Boca neutra pensativa */}
    <path d="M54 74 L66 74" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    {/* Burbuja de pensamiento */}
    <circle cx="96" cy="30" r="7" fill={CREAM} stroke={INK} strokeWidth="2" />
    <circle cx="104" cy="20" r="4" fill={CREAM} stroke={INK} strokeWidth="2" />
  </Svg>
);

export const Celebrando: FC<PoseProps> = (props) => (
  <Svg {...props}>
    {/* Chispas de celebración */}
    <g stroke={COLLAR} strokeWidth="2.5" strokeLinecap="round">
      <path d="M16 24 l6 6" />
      <path d="M104 24 l-6 6" />
      <path d="M14 54 l8 0" />
    </g>
    <Head
      eyes={
        <g stroke="none">
          {/* Ojos cerrados de alegría (arcos) */}
          <path d="M42 54 Q48 48 54 54" fill="none" stroke={INK} strokeWidth="2.5" />
          <path d="M66 54 Q72 48 78 54" fill="none" stroke={INK} strokeWidth="2.5" />
        </g>
      }
    />
    {/* Boca abierta sonriendo */}
    <path d="M50 70 Q60 84 70 70 Z" fill={CREAM} stroke={INK} strokeWidth="2.5" />
  </Svg>
);

export const Animando: FC<PoseProps> = (props) => (
  <Svg {...props}>
    <Head eyes={OpenEyes} />
    {/* Sonrisa cálida (anima, no se burla) */}
    <path
      d="M50 72 Q60 79 70 72"
      fill="none"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Patita de ánimo */}
    <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
      <circle cx="98" cy="74" r="8" fill={FUR} />
    </g>
    {/* Corazón de ánimo */}
    <path
      d="M20 70 q-5 -6 2 -10 q5 -3 6 3 q1 -6 6 -3 q7 4 2 10 l-8 8 Z"
      fill={COLLAR}
      stroke="none"
    />
  </Svg>
);

export const Saludando: FC<PoseProps> = (props) => (
  <Svg {...props}>
    <Head eyes={OpenEyes} />
    <path
      d="M52 72 Q60 80 68 72"
      fill="none"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Patita levantada en saludo */}
    <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
      <path d="M92 70 q10 -8 14 2 q2 8 -8 10 Z" fill={FUR} />
    </g>
  </Svg>
);

export const Durmiendo: FC<PoseProps> = (props) => (
  <Svg {...props}>
    <Head
      eyes={
        <g stroke="none">
          {/* Ojos cerrados (líneas) */}
          <path d="M42 55 L54 55" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M66 55 L78 55" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      }
    />
    {/* Boca tranquila */}
    <path
      d="M55 73 Q60 76 65 73"
      fill="none"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Zzz */}
    <g fill={COLLAR} stroke="none" fontFamily="sans-serif" fontWeight="700">
      <text x="88" y="30" fontSize="12">
        z
      </text>
      <text x="98" y="22" fontSize="16">
        Z
      </text>
    </g>
  </Svg>
);
