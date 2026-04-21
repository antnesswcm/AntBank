import { ReactNode } from 'react';
import './SettingsItem.css';

export interface SettingsItemProps {
  label: string;
  children: ReactNode;
}

export function SettingsItem({ label, children }: SettingsItemProps) {
  return (
    <div className="settings-item">
      <span className="settings-item-label">{label}</span>
      <div className="settings-item-control">{children}</div>
    </div>
  );
}
