"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/session";

function initials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function Avatar({ user }: { user: SessionUser }) {
  return (
    <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden border-2 border-zinc-700 bg-orange-500 text-[11px] font-black text-zinc-950">
      <span aria-hidden>{initials(user.name)}</span>
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </span>
  );
}

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const canShip = user.role === "SHIPPER" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";

  return (
    <div
      ref={wrapRef}
      className="relative ml-2"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border-2 border-zinc-700 bg-zinc-900 px-2 py-1 transition hover:border-orange-500 focus:outline-none"
      >
        <Avatar user={user} />
        <span className="mc-mono max-w-[10rem] truncate text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-100">
          {user.name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 border-2 border-zinc-700 bg-zinc-900 p-1 shadow-[4px_4px_0_#09090b]"
        >
          <span className="mc-rivet mc-rivet-tl" />
          <span className="mc-rivet mc-rivet-tr" />
          <span className="mc-rivet mc-rivet-bl" />
          <span className="mc-rivet mc-rivet-br" />
          <p className="mc-mono px-3 pb-2 pt-2 text-[9px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ OPERATOR MENU
          </p>
          <MenuLink href="/account">Tài khoản của tôi</MenuLink>
          <MenuLink href="/cart">Giỏ hàng</MenuLink>
          <MenuLink href="/orders">Đơn mua</MenuLink>
          {canShip && (
            <MenuLink href="/shipping">Quản lý vận chuyển</MenuLink>
          )}
          {isAdmin && <MenuLink href="/admin">Trang quản trị</MenuLink>}
          <div className="my-1 h-[2px] bg-zinc-800" />
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="mc-mono block w-full px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300 transition hover:bg-orange-500 hover:text-zinc-950"
            >
              ▸ Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="mc-mono block px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300 transition hover:bg-orange-500 hover:text-zinc-950"
    >
      ▸ {children}
    </Link>
  );
}
