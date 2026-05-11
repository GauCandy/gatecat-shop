import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginFormClient } from "@/components/LoginFormClient";
import { getSiteSettings } from "@/lib/site";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  state: "Phiên đăng nhập không hợp lệ, vui lòng thử lại.",
  oauth: "Không thể xác thực với Google. Vui lòng thử lại.",
};

export default async function LoginPage({ searchParams }: Props) {
  const [{ error }, settings] = await Promise.all([
    searchParams,
    getSiteSettings(),
  ]);
  const message = error ? ERROR_MESSAGES[error] : null;

  return (
    <>
      <Header />
      <main className="relative flex flex-1 items-center justify-center bg-zinc-950 px-4 py-16">
        <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-20" />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-orange-500/15 blur-[140px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-yellow-500/8 blur-[140px]"
        />

        <div className="relative w-full max-w-md">
          <div className="relative border-2 border-zinc-700 bg-zinc-900 p-8">
            <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

            <Link href="/" className="flex items-center gap-3">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt={settings.siteName} className="h-10 w-auto object-contain" />
              ) : (
                <span
                  aria-hidden
                  className="relative grid h-10 w-10 shrink-0 place-items-center border-2 border-zinc-600 bg-zinc-950"
                >
                  <span className="mc-rivet mc-rivet-tl" />
                  <span className="mc-rivet mc-rivet-tr" />
                  <span className="mc-rivet mc-rivet-bl" />
                  <span className="mc-rivet mc-rivet-br" />
                  <span className="text-[14px] font-black text-orange-500">GC</span>
                </span>
              )}
              <span className="block text-[16px] font-black uppercase tracking-[0.06em] text-zinc-100">
                {settings.siteName}
              </span>
            </Link>

            <h1 className="mt-7 text-[28px] font-black uppercase leading-[1.05] tracking-[-0.03em] text-zinc-100">
              Đăng nhập<span className="text-orange-500">.</span>
            </h1>
            <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              ▸ Đăng nhập để theo dõi đơn hàng và mua sắm
            </p>

            {message && (
              <div className="relative mt-6 border-2 border-red-500/60 bg-red-500/10 px-4 py-3">
                <span className="mc-mono mb-1 block text-[10px] font-black uppercase tracking-[0.28em] text-red-400">
                  ⬢ Lỗi xác thực
                </span>
                <p className="mc-mono text-[11px] uppercase tracking-[0.12em] text-red-300">
                  {message}
                </p>
              </div>
            )}

            <LoginFormClient />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
