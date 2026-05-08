import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getSiteSettings } from "@/lib/site";
import { AdminNavLink } from "./AdminNavLink";

const navItems = [
  { href: "/admin/dashboard", label: "DASHBOARD", desc: "Tổng quan", glyph: "01" },
  { href: "/admin/site", label: "SITE CONFIG", desc: "Giao diện web", glyph: "02" },
  { href: "/admin/categories", label: "CLASS BAY", desc: "Danh mục", glyph: "03" },
  { href: "/admin/products", label: "INVENTORY", desc: "Sản phẩm", glyph: "04" },
  { href: "/admin/vouchers", label: "VOUCHERS", desc: "Mã giảm giá", glyph: "05" },
  { href: "/admin/users", label: "OPERATORS", desc: "Người dùng", glyph: "06" },
  { href: "/admin/reviews", label: "REPORTS", desc: "Đánh giá", glyph: "07" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings] = await Promise.all([
    requireAdmin(),
    getSiteSettings(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <div className="mc-hazard h-1.5" />
      <header className="sticky top-0 z-40 border-b-2 border-orange-500 bg-zinc-950/95 backdrop-blur-md">
        <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex h-14 w-full items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={settings.logoUrl} alt={settings.siteName} className="h-9 w-auto object-contain" />
            ) : (
              <span className="relative grid h-9 w-9 place-items-center border-2 border-zinc-700 bg-zinc-900">
                <span className="mc-rivet mc-rivet-tl" />
                <span className="mc-rivet mc-rivet-tr" />
                <span className="mc-rivet mc-rivet-bl" />
                <span className="mc-rivet mc-rivet-br" />
                <span className="text-[12px] font-black text-orange-500">GC</span>
              </span>
            )}
            <span className="leading-none">
              <span className="block text-[14px] font-black uppercase tracking-[0.06em] text-zinc-100">
                {settings.siteName}<span className="text-orange-500">/</span>ADMIN
              </span>
              <span className="mc-mono mt-1 block text-[8px] font-bold uppercase tracking-[0.4em] text-orange-500">
                ⬢ control center
              </span>
            </span>
          </Link>
          <div className="mc-mono flex items-center gap-3">
            <span className="hidden items-center gap-1.5 border-2 border-orange-500/60 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-orange-300 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 [animation:mc-pulse_1.4s_ease-in-out_infinite]" />
              ADMIN MODE
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-400">
              ▸ {user.name}
            </span>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 self-start overflow-y-auto border-r-2 border-zinc-800 bg-zinc-900 md:block">
          <p className="mc-mono border-b-2 border-zinc-800 px-4 pt-4 pb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ ADMIN CONSOLE
          </p>
          <nav aria-label="Điều hướng quản trị" className="flex flex-col">
            {navItems.map((item) => (
              <AdminNavLink key={item.href} href={item.href}>
                <span className="flex items-center gap-3">
                  <span className="text-zinc-600">⬢ {item.glyph}</span>
                  <span>
                    <span className="block">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-[0.04em] text-zinc-500">
                      {item.desc}
                    </span>
                  </span>
                </span>
              </AdminNavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-5 text-zinc-100">{children}</main>
      </div>
    </div>
  );
}
