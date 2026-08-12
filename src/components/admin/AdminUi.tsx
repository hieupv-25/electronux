import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="admin-page-header">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </section>
  );
}

export function StatusBadge({
  value,
  labels,
}: {
  value: string;
  labels: Record<string, string>;
}) {
  return (
    <span className={`admin-status admin-status--${value}`}>
      {labels[value] ?? value}
    </span>
  );
}

export function EmptyTable({ columns, label }: { columns: number; label: string }) {
  return (
    <tr>
      <td className="admin-empty" colSpan={columns}>
        {label}
      </td>
    </tr>
  );
}

export function EmptyBlock({ children }: { children: ReactNode }) {
  return <p className="admin-empty admin-empty--block">{children}</p>;
}
