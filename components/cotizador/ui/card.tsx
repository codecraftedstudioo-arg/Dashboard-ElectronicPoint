import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold text-fg">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-fg-muted">{subtitle}</p> : null}
    </div>
  );
}
