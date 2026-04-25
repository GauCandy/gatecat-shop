import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccountNav } from "@/components/AccountNav";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("/login");

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="mb-5 flex items-center gap-1.5 text-[13px] text-[var(--color-text-dim)]">
            <Link href="/" className="transition hover:text-[var(--color-text)]">
              Trang chủ
            </Link>
            <span className="text-[var(--color-border)]">/</span>
            <span className="font-medium text-[var(--color-text)]">Tài khoản</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <AccountNav userName={user.name} userEmail={user.email} avatarUrl={user.avatarUrl} />
            <section className="min-w-0">{children}</section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
