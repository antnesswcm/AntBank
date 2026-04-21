import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';
export type IconPosition = 'left' | 'right';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  block?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  block = false,
  onClick,
  type = 'button',
  className = '',
  style,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isIconOnly = !children && icon;

  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    block ? 'btn-block' : '',
    loading ? 'btn-loading' : '',
    isIconOnly ? 'btn-icon-only' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const IconComponent = icon;

  return (
    <button
      type={type}
      className={classNames}
      style={style}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading ? (
        <Loader2 className="btn-spinner" size={getIconSize(size)} />
      ) : (
        <>
          {IconComponent && iconPosition === 'left' && (
            <span className="btn-icon btn-icon-left">{IconComponent}</span>
          )}
          {children && <span className="btn-text">{children}</span>}
          {IconComponent && iconPosition === 'right' && (
            <span className="btn-icon btn-icon-right">{IconComponent}</span>
          )}
        </>
      )}
    </button>
  );
}

function getIconSize(size: ButtonSize): number {
  switch (size) {
    case 'small':
      return 14;
    case 'large':
      return 20;
    default:
      return 16;
  }
}
