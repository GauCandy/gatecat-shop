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
    <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--color-text)] text-[11px] font-semibold text-white">
      <span aria-hidden>{initials(user.name)}</span>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 h-full w-full rounded-full object-cover"
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
        className="flex items-center gap-2 rounded-full px-1 py-1 pr-3 transition hover:bg-[var(--color-surface-2)] focus:outline-none"
      >
        <Avatar user={user} />
        <span className="max-w-[10rem] truncate text-[13px] font-medium text-[var(--color-text)]">
          {user.name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-white p-1 shadow-lg"
        >
          <MenuLink href="/account">Tài khoản của tôi</MenuLink>
          <MenuLink href="/cart">Giỏ hàng</MenuLink>
          <MenuLink href="/orders">Đơn mua</MenuLink>
          {canShip && (
            <MenuLink href="/shipping">Quản lý vận chuyển</MenuLink>
          )}
          {isAdmin && <MenuLink href="/admin">Trang quản trị</MenuLink>}
          <div className="my-1 h-px bg-[var(--color-border)]" />
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
            >
              Đăng xuất
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
      className="block rounded-lg px-3 py-2 text-[13px] text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
    >
      {children}
    </Link>
  );
}
