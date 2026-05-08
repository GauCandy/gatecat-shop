"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SessionUser } from "@/lib/session";
import type { Category, CategoryNode } from "@/lib/categories-types";
import { buildTree } from "@/lib/category-tree";
import { UserMenu } from "./UserMenu";

export function HeaderClient({
  user,
  categories,
  cartCount,
  siteName,
  logoUrl,
}: {
  user: SessionUser | null;
  categories: Category[];
  cartCount: number;
  siteName: string;
  logoUrl: string | null;
}) {
  const [hideSubNav, setHideSubNav] = useState(false);
  const roots = useMemo(() => buildTree(categories), [categories]);

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const initialQ = pathname === "/products" ? sp.get("q") ?? "" : "";
  const [query, setQuery] = useState(initialQ);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/products") setQuery(sp.get("q") ?? "");
    else setQuery("");
  }, [pathname, sp]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const href = q ? `/products?q=${encodeURIComponent(q)}` : "/products";
    setMobileSearchOpen(false);
    router.push(href);
  };

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
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 text-zinc-100 backdrop-blur-md">
        <div className="relative mx-auto flex h-[64px] w-full items-center gap-4 px-4 sm:px-6 lg:w-2/3 lg:px-0">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt={siteName}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-[13px] font-bold text-zinc-950"
              >
                {siteName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-[16px] font-bold tracking-tight text-zinc-100">
              {siteName}
            </span>
          </Link>

          {/* Search */}
          <form
            role="search"
            className="relative hidden min-w-0 flex-1 md:block"
            onSubmit={submitSearch}
          >
            <button
              type="submit"
              aria-label="Tìm"
              className="absolute left-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center text-zinc-500 transition hover:text-orange-500"
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
            <input
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm, danh mục..."
              className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 pl-10 pr-4 text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
            />
          </form>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Mobile search toggle */}
            <button
              type="button"
              aria-label="Tìm kiếm"
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-orange-500/60 hover:text-orange-400 md:hidden"
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

            {/* Cart */}
            {user && (
              <Link
                href="/cart"
                aria-label="Giỏ hàng"
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-orange-500/60 hover:text-orange-400"
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
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-zinc-950">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User */}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/account"
                  aria-label="Tài khoản"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-orange-500/60 hover:text-orange-400"
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
                  className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-[13px] font-bold text-zinc-950 transition hover:bg-orange-400"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search expanded */}
        {mobileSearchOpen && (
          <div className="border-t border-zinc-800 bg-zinc-900 px-4 py-2 sm:px-6 md:hidden">
            <form role="search" onSubmit={submitSearch} className="relative">
              <button
                type="submit"
                aria-label="Tìm"
                className="absolute left-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center text-zinc-500 transition hover:text-orange-500"
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
              <input
                type="search"
                name="q"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-4 text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </form>
          </div>
        )}
      </header>

      {/* Sub-navigation */}
      <nav
        aria-label="Danh mục sản phẩm"
        className={`sticky top-[64px] z-40 border-b border-zinc-800 bg-zinc-950 text-zinc-300 transition-transform duration-300 ${
          hideSubNav ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <ul className="flex items-center gap-0.5 overflow-x-auto py-2">
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
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-orange-400"
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
            className="z-[60] w-56 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-xl shadow-zinc-950/50"
          >
            <Link
              href={`/category/${node.slug}`}
              role="menuitem"
              className="block rounded-md px-3 py-2 text-[13px] font-semibold text-zinc-100 transition hover:bg-orange-500 hover:text-zinc-950"
            >
              Tất cả {node.name}
            </Link>
            <div className="my-1 h-px bg-zinc-800" />
            {node.children.map((child) => (
              <SubNavChildRow key={child.id} child={child} />
            ))}
          </div>,
          document.body
        )}
    </li>
  );
}

function SubNavChildRow({ child }: { child: CategoryNode }) {
  const hasGrandchildren = child.children.length > 0;
  const [open, setOpen] = useState(false);
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

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (!hasGrandchildren) return;
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={() => hasGrandchildren && scheduleClose()}
    >
      <Link
        href={`/category/${child.slug}`}
        role="menuitem"
        aria-haspopup={hasGrandchildren ? "menu" : undefined}
        aria-expanded={hasGrandchildren ? open : undefined}
        onClick={(e) => {
          if (!hasGrandchildren) return;
          if (window.matchMedia("(hover: none)").matches && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-[13px] text-zinc-400 transition hover:bg-orange-500 hover:text-zinc-950"
      >
        <span className="truncate">{child.name}</span>
        {hasGrandchildren && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-3 w-3 shrink-0"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        )}
      </Link>

      {hasGrandchildren && open && (
        <div
          role="menu"
          className="absolute left-full top-0 z-[61] ml-1 w-56 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-xl shadow-zinc-950/50"
        >
          <Link
            href={`/category/${child.slug}`}
            role="menuitem"
            className="block rounded-md px-3 py-2 text-[13px] font-semibold text-zinc-100 transition hover:bg-orange-500 hover:text-zinc-950"
          >
            Tất cả {child.name}
          </Link>
          <div className="my-1 h-px bg-zinc-800" />
          {child.children.map((g) => (
            <Link
              key={g.id}
              href={`/category/${g.slug}`}
              role="menuitem"
              className="block rounded-md px-3 py-2 text-[13px] text-zinc-400 transition hover:bg-orange-500 hover:text-zinc-950"
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
