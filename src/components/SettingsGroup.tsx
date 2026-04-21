import { ReactNode } from 'react';
import './SettingsGroup.css';

export interface SettingsGroupProps {
  title: string;
  children: ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <div className="settings-group">
      <div className="settings-group-title">{title}</div>
      <div className="settings-group-content">{children}</div>
    </div>
  );
}
