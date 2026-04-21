import { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import './PageLayout.css';

export interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <>
      <PageHeader title={title} />
      <div className="content-body">{children}</div>
    </>
  );
}
