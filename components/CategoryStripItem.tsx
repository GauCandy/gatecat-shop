"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CategoryNode } from "@/lib/categories";

export function CategoryStripItem({
  node,
  className = "",
}: {
  node: CategoryNode;
  className?: string;
}) {
  const hasChildren = node.children.length > 0;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <li
      ref={wrapRef}
      className={`relative ${className}`}
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <Link
        href={`/category/${node.slug}`}
        aria-haspopup={hasChildren ? "menu" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onClick={(e) => {
          if (!hasChildren) return;
          // Trên mobile (không hover), chạm đầu tiên mở menu thay vì điều hướng.
          if (window.matchMedia("(hover: none)").matches && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group flex flex-col items-center gap-1.5 rounded-xl border border-[var(--color-border)] p-2 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
      >
        <span
          className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[var(--color-surface-2)] text-[12px] font-semibold text-[var(--color-text)] transition group-hover:bg-[var(--color-accent-soft)] group-hover:text-[var(--color-accent)]"
          aria-hidden
        >
          {node.imageUrl ? (
            <span
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${node.imageUrl})` }}
            />
          ) : (
            node.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="line-clamp-1 text-[11px] font-medium text-[var(--color-text-dim)] transition group-hover:text-[var(--color-text)]">
          {node.name}
        </span>
      </Link>

      {hasChildren && open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-30 mt-1 w-48 -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-white p-1 shadow-lg"
        >
          <Link
            href={`/category/${node.slug}`}
            role="menuitem"
            className="block rounded-md px-3 py-2 text-[13px] font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
          >
            Tất cả {node.name}
          </Link>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          {node.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              role="menuitem"
              className="block rounded-md px-3 py-2 text-[13px] text-[var(--color-text-dim)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}
