import { ReactNode } from 'react';
import './FixedFooter.css';

export interface FixedFooterProps {
  children: ReactNode;
  footer: ReactNode;
}

export function FixedFooter({ children, footer }: FixedFooterProps) {
  return (
    <div className="fixed-footer-layout">
      <div className="fixed-footer-content">{children}</div>
      <div className="fixed-footer-bar">{footer}</div>
    </div>
  );
}
