"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SessionUser } from "@/lib/session";
import type { Category, CategoryNode } from "@/lib/categories-types";
import { buildTree } from "@/lib/category-tree";
import { UserMenu } from "./UserMenu";

export function HeaderClient({
  user,
  categories,
}: {
  user: SessionUser | null;
  categories: Category[];
}) {
  const [hideSubNav, setHideSubNav] = useState(false);
  const roots = useMemo(() => buildTree(categories), [categories]);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < 80) {
        setHideSubNav(false);
      } else if (delta > 4) {
        setHideSubNav(true);
      } else if (delta < -4) {
        setHideSubNav(false);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full items-center gap-4 px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-text)] text-[11px] font-semibold text-white">
              G
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Gatecat
            </span>
          </Link>

          <form
            role="search"
            className="relative hidden min-w-0 flex-1 md:block"
            onSubmit={(e) => e.preventDefault()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-dim)]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Tìm sản phẩm, danh mục..."
              className="h-9 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-9 pr-4 text-[13px] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-accent)] focus:bg-white focus:outline-none"
            />
          </form>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--color-text-dim)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Giỏ hàng"
              className="relative grid h-9 w-9 place-items-center rounded-full text-[var(--color-text-dim)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>

            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/account"
                  aria-label="Tài khoản"
                  className="grid h-9 w-9 place-items-center rounded-full text-[var(--color-text-dim)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </Link>

                <Link
                  href="/login"
                  className="ml-2 inline-flex items-center rounded-full bg-[var(--color-text)] px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-black"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Danh mục sản phẩm"
        className={`sticky top-14 z-40 border-b border-[var(--color-border)] bg-white/85 backdrop-blur-xl transition-transform duration-300 ${
          hideSubNav ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <ul className="flex items-center gap-1 overflow-x-auto py-2">
            {roots.map((node) => (
              <SubNavItem key={node.id} node={node} />
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

function SubNavItem({ node }: { node: CategoryNode }) {
  const hasChildren = node.children.length > 0;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLLIElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  return (
    <li
      ref={wrapRef}
      className="relative shrink-0"
      onMouseEnter={() => {
        if (!hasChildren) return;
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={() => hasChildren && scheduleClose()}
    >
      <Link
        href={`/category/${node.slug}`}
        aria-haspopup={hasChildren ? "menu" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onClick={(e) => {
          if (!hasChildren) return;
          if (window.matchMedia("(hover: none)").matches && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="hologram-frame inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-[var(--color-text-dim)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
      >
        {node.name}
        {hasChildren && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-3 w-3"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </Link>

      {hasChildren && open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: pos.top, left: pos.left }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="z-[60] w-52 rounded-lg border border-[var(--color-border)] bg-white p-1 shadow-lg"
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
          </div>,
          document.body
        )}
    </li>
  );
}
