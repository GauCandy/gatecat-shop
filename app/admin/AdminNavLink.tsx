"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`block border-l-2 px-4 py-2 text-[13px] transition ${
        active
          ? "border-[var(--color-text)] bg-slate-100 font-medium text-[var(--color-text)]"
          : "border-transparent text-[var(--color-text-dim)] hover:bg-slate-50 hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </Link>
  );
}
