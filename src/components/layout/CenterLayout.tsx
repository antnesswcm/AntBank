import { ReactNode } from 'react';
import './CenterLayout.css';

export interface CenterLayoutProps {
  children: ReactNode;
  maxWidth?: string | number;
  horizontal?: boolean;
  vertical?: boolean;
}

export function CenterLayout({
  children,
  maxWidth,
  horizontal = true,
  vertical = true,
}: CenterLayoutProps) {
  const style: React.CSSProperties = {};

  if (maxWidth) {
    style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  }

  const className = `center-layout${horizontal ? ' center-horizontal' : ''}${vertical ? ' center-vertical' : ''}`;

  return (
    <div className={className}>
      <div className="center-content" style={style}>
        {children}
      </div>
    </div>
  );
}
