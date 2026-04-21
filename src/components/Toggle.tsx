import './Toggle.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <div
      className={`toggle ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="toggle-knob" />
    </div>
  );
}
