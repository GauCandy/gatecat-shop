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
    <div className="mb-6 border-b-2 border-zinc-800 pb-5">
      <nav className="mc-mono mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="transition hover:text-orange-400"
              >
                ▸ {crumb.label}
              </Link>
            ) : (
              <span className="font-black text-orange-400">
                ⬢ {crumb.label}
              </span>
            )}
            {idx < breadcrumbs.length - 1 && (
              <span className="text-zinc-700">/</span>
            )}
          </div>
        ))}
      </nav>

      <div>
        <h1 className="text-[26px] font-black uppercase leading-[1.05] tracking-[-0.03em] text-zinc-100 sm:text-[32px]">
          {title}
          <span className="text-orange-500">.</span>
        </h1>
        {description && (
          <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ {description}
          </p>
        )}
      </div>
    </div>
  );
}
