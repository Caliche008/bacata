import type { ButtonHTMLAttributes } from 'react';
import './components.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

/**
 * Botón accesible: elemento <button> nativo, `type="button"` por defecto para
 * no enviar formularios por accidente, objetivo táctil >= 44px (vía CSS) y foco
 * visible global. Reenvía `aria-*`, `onClick` y demás props nativas.
 */
export function Button({
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'bc-button',
    `bc-button--${variant}`,
    fullWidth ? 'bc-button--fullWidth' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
