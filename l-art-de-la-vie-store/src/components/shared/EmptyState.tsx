import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--cream)]/50 px-6 py-16 text-center">
      {icon ? <div className="mb-4 text-[color:var(--forest)]">{icon}</div> : null}
      <h3 className="font-serif text-2xl text-[color:var(--ink)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[color:var(--ink-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
