import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { ShippingNavLink } from "./ShippingNavLink";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/shipping/all", label: "Tất cả đơn hàng" },
  { href: "/shipping", label: "Xác nhận đơn hàng" },
  { href: "/shipping/preparing", label: "Đang chuẩn bị hàng" },
  { href: "/shipping/delivering", label: "Đang giao" },
];

export default async function ShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER" && user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-12 w-full items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-[var(--color-text)] text-[11px] font-semibold text-white">
              G
            </span>
            <span className="text-[14px] font-semibold tracking-tight">
              Gatecat · Vận chuyển
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
          <nav aria-label="Điều hướng vận chuyển" className="flex flex-col">
            {navItems.map((item) => (
              <ShippingNavLink key={item.href} href={item.href}>
                {item.label}
              </ShippingNavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-5">{children}</main>
      </div>
    </div>
  );
}
