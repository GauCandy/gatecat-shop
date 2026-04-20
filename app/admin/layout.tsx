import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminNavLink } from "./AdminNavLink";

const navItems = [
  { href: "/admin/categories", label: "Quản lí danh mục" },
  { href: "/admin/products", label: "Quản lí sản phẩm" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-12 w-full items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-[var(--color-text)] text-[11px] font-semibold text-white">
              G
            </span>
            <span className="text-[14px] font-semibold tracking-tight">
              Gatecat · Quản trị
            </span>
          </Link>
          <span className="text-[13px] text-[var(--color-text-dim)]">
            {user.name}
          </span>
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-56 shrink-0 self-start overflow-y-auto border-r border-slate-200 bg-white md:block">
          <p className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Điều hướng
          </p>
          <nav aria-label="Điều hướng quản trị" className="flex flex-col">
            {navItems.map((item) => (
              <AdminNavLink key={item.href} href={item.href}>
                {item.label}
              </AdminNavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-5">{children}</main>
      </div>
    </div>
  );
}
