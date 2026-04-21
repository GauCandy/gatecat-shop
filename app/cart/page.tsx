import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartClient } from "@/components/CartClient";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { listCartItems } from "@/lib/cart";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("/");

  const items = await listCartItems(user.id);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:w-2/3 lg:px-0">
          <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-[var(--color-text-dim)]">
            <Link href="/" className="hover:text-[var(--color-text)]">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">Giỏ hàng</span>
          </nav>
          <h1 className="mb-6 text-[24px] font-semibold tracking-tight text-[var(--color-text)] sm:text-[28px]">
            Giỏ hàng của bạn
          </h1>
          <CartClient initialItems={items} />
        </div>
      </main>
      <Footer />
    </>
  );
}
