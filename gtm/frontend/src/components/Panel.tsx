import type { ReactNode } from 'react';

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <article className={`rounded-lg border border-[#dde5ee] bg-white p-3.5 shadow-[0_10px_24px_rgba(28,38,51,0.06)] md:p-[18px] ${className}`}>
      {children}
    </article>
  );
}
