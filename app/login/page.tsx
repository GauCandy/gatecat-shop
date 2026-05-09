import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmailOtpForm } from "@/components/EmailOtpForm";
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
          {/* Authentication terminal frame */}
          <div className="relative border-2 border-zinc-700 bg-zinc-900 p-8">
            <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

            {/* HUD strip */}
            <div className="mb-6 flex items-center justify-between border-b-2 border-zinc-800 pb-3">
              <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.32em] text-orange-500">
                ⬢ AUTH TERMINAL
              </p>
              <span className="mc-mono flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 [animation:mc-pulse_1.4s_ease-in-out_infinite]" />
                ONLINE
              </span>
            </div>

            <Link href="/" className="flex items-center gap-3">
              {settings.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
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
              <span className="leading-none">
                <span className="block text-[16px] font-black uppercase tracking-[0.06em] text-zinc-100">
                  {settings.siteName}
                </span>
                <span className="mc-mono mt-1 block text-[8px] font-bold uppercase tracking-[0.4em] text-orange-500">
                  ⬢ heavy industries
                </span>
              </span>
            </Link>

            <h1 className="mt-7 text-[28px] font-black uppercase leading-[1.05] tracking-[-0.03em] text-zinc-100">
              ACCESS REQUEST<span className="text-orange-500">.</span>
            </h1>
            <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              ▸ Xác thực để vào hệ thống & theo dõi đơn vận hành
            </p>

            {message && (
              <div className="relative mt-6 border-2 border-red-500/60 bg-red-500/10 px-4 py-3">
                <span className="mc-mono mb-1 block text-[10px] font-black uppercase tracking-[0.28em] text-red-400">
                  ⬢ ERR · AUTH FAILED
                </span>
                <p className="mc-mono text-[11px] uppercase tracking-[0.12em] text-red-300">
                  {message}
                </p>
              </div>
            )}

            <a
              href="/api/auth/google/start"
              className="mc-mono group relative mt-7 flex w-full items-center justify-center gap-3 border-2 border-zinc-700 bg-zinc-950 px-4 py-3.5 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100 transition hover:border-orange-500 hover:bg-zinc-900 hover:text-orange-400 hover:shadow-[4px_4px_0_#09090b] hover:translate-x-[-2px] hover:translate-y-[-2px]"
            >
              <GoogleIcon />
              <span>⬢ Đăng nhập với Google</span>
            </a>

            <div className="mt-6 flex items-center gap-3">
              <span aria-hidden className="h-px flex-1 bg-zinc-800" />
              <span className="mc-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
                hoặc
              </span>
              <span aria-hidden className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="mt-6">
              <EmailOtpForm />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {[
                { l: "ENC", v: "OTP·HMAC" },
                { l: "SVR", v: "SG·1" },
                { l: "TLS", v: "1.3" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="border border-zinc-700 bg-zinc-950 px-2 py-2"
                >
                  <p className="mc-mono text-[8px] font-bold uppercase tracking-[0.32em] text-zinc-500">
                    {s.l}
                  </p>
                  <p className="mc-mono mt-1 text-[11px] font-black uppercase tracking-[0.15em] text-orange-400">
                    {s.v}
                  </p>
                </div>
              ))}
            </div>

            <p className="mc-mono mt-7 border-t-2 border-zinc-800 pt-4 text-center text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              ▸ Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link
                href="/legal#terms"
                className="text-orange-400 underline transition hover:text-orange-300"
              >
                điều khoản
              </Link>{" "}
              và{" "}
              <Link
                href="/legal#privacy"
                className="text-orange-400 underline transition hover:text-orange-300"
              >
                chính sách bảo mật
              </Link>
              .
            </p>
          </div>

          <p className="mc-mono mt-4 text-center text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-600">
            ⬢ SN · GC·AUTH·26 · PLANT 01
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 13.9-5.4l-6.4-5.4c-2.1 1.4-4.7 2.3-7.5 2.3-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.4 5.4c3.7-3.4 6.5-8.5 6.5-15 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
