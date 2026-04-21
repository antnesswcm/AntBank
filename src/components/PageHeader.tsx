import './PageHeader.css';

export interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="content-header">
      <h2>{title}</h2>
    </div>
  );
}
