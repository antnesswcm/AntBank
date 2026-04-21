import './MetaItem.css';

export interface MetaItemProps {
  label: string;
  value: string | number;
}

export function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div className="meta-item">
      <div className="meta-value">{value}</div>
      <div className="meta-label">{label}</div>
    </div>
  );
}
