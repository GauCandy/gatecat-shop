import Link from "next/link";
import type { CategoryNode } from "@/lib/categories";

export function CategoryStripItem({
  node,
  className = "",
}: {
  node: CategoryNode;
  className?: string;
}) {
  return (
    <li className={`relative ${className}`}>
      <Link
        href={`/category/${node.slug}`}
        className="group flex flex-col items-center gap-1.5 rounded-xl border border-[var(--color-border)] p-2 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
      >
        <span
          className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[var(--color-surface-2)] text-[12px] font-semibold text-[var(--color-text)] transition group-hover:bg-[var(--color-accent-soft)] group-hover:text-[var(--color-accent)]"
          aria-hidden
        >
          {node.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-6 w-6 object-contain"
            />
          ) : (
            node.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="line-clamp-1 text-[11px] font-medium text-[var(--color-text-dim)] transition group-hover:text-[var(--color-text)]">
          {node.name}
        </span>
      </Link>
    </li>
  );
}
