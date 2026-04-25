"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/account/info", label: "Thông tin tài khoản", icon: "👤" },
  { href: "/account/addresses", label: "Sổ địa chỉ", icon: "📍" },
];

export function AccountNav({
  userName,
  userEmail,
  avatarUrl,
}: {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-[4.75rem] h-fit">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-white shadow-sm">
        <div className="border-b border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)]/80 text-[15px] font-bold text-white shadow-md">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[var(--color-text)]">
                {userName}
              </p>
              <p className="truncate text-[12px] text-[var(--color-text-dim)]">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col">
          {NAV.map((n, idx) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative px-4 py-3 text-[14px] font-medium transition ${
                  idx > 0 ? "border-t border-[var(--color-border)]" : ""
                } ${
                  active
                    ? "bg-[var(--color-accent)]/8 text-[var(--color-accent)]"
                    : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                } ${active ? "after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-[var(--color-accent)]" : ""}`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <span className="text-[16px]">{n.icon}</span>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
