import { ReactNode } from 'react';
import './MetaCard.css';

export interface MetaCardProps {
  title?: string;
  children: ReactNode;
}

export function MetaCard({ title, children }: MetaCardProps) {
  return (
    <div className="meta-card">
      {title && <div className="meta-card-title">{title}</div>}
      <div className="meta-card-content">{children}</div>
    </div>
  );
}
