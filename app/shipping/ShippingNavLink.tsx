"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ShippingNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`mc-mono relative block border-b-2 border-zinc-800 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition ${
        active
          ? "bg-orange-500/10 text-orange-400"
          : "text-zinc-400 hover:bg-zinc-950 hover:text-zinc-100"
      }`}
    >
      {active && (
        <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-orange-500" />
      )}
      {children}
    </Link>
  );
}
