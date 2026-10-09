import { useId, type HTMLAttributes, type ReactNode } from 'react';
import './components.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'div';
  title?: string;
  headingLevel?: 2 | 3 | 4;
  children?: ReactNode;
}

/**
 * Superficie reutilizable. Si recibe `title`, renderiza un encabezado del nivel
 * indicado y asocia la región con `aria-labelledby` para los lectores de
 * pantalla. Sin lógica de contenido ni de almacenamiento.
 */
export function Card({
  as = 'section',
  title,
  headingLevel = 2,
  className,
  children,
  ...rest
}: CardProps) {
  const headingId = useId();
  const Tag = as;
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const classes = ['bc-card', className ?? ''].filter(Boolean).join(' ');

  return (
    <Tag
      className={classes}
      aria-labelledby={title ? headingId : undefined}
      {...rest}
    >
      {title ? (
        <Heading id={headingId} className="bc-card__title">
          {title}
        </Heading>
      ) : null}
      {children}
    </Tag>
  );
}
