import Link from "next/link";

export type Breadcrumb = {
  href?: string;
  label: string;
};

export function PageHeader({
  breadcrumbs,
  title,
  description,
}: {
  breadcrumbs: Breadcrumb[];
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <nav className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--color-text-dim)]">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="transition hover:text-[var(--color-text)]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--color-text)]">
                {crumb.label}
              </span>
            )}
            {idx < breadcrumbs.length - 1 && (
              <span className="text-[var(--color-border)]">/</span>
            )}
          </div>
        ))}
      </nav>

      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[14px] text-[var(--color-text-dim)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
