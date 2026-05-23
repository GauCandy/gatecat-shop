import Link from "next/link";
import { cookies } from "next/headers";
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

type BanInfo = {
  reason: string | null;
  bannedAt: string;
  email: string;
};

function parseBanInfo(raw: string | undefined): BanInfo | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (typeof v?.bannedAt === "string") {
      return {
        reason: typeof v.reason === "string" ? v.reason : null,
        bannedAt: v.bannedAt,
        email: typeof v.email === "string" ? v.email : "",
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
};

export default async function LoginPage({ searchParams }: Props) {
  const [{ error }, settings, cookieStore] = await Promise.all([
    searchParams,
    getSiteSettings(),
    cookies(),
  ]);

  const isBanned = error === "banned";
  const banInfo = isBanned ? parseBanInfo(cookieStore.get("ban_info")?.value) : null;
  const message = error && !isBanned ? ERROR_MESSAGES[error] : null;

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

            {isBanned && (
              <BannedNotice
                reason={banInfo?.reason ?? null}
                bannedAt={banInfo?.bannedAt ?? null}
                email={banInfo?.email ?? null}
              />
            )}

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

function BannedNotice({
  reason,
  bannedAt,
  email,
}: {
  reason: string | null;
  bannedAt: string | null;
  email: string | null;
}) {
  return (
    <div className="relative mt-6 border-2 border-red-500/70 bg-red-500/10 p-5">
      <span className="mc-mono mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-red-400">
        ⛔ Tài khoản đã bị cấm
      </span>
      <p className="text-[14px] font-bold leading-snug text-red-200">
        Tài khoản của bạn hiện đang bị cấm truy cập hệ thống.
      </p>

      {email && (
        <p className="mc-mono mt-3 text-[11px] uppercase tracking-[0.12em] text-zinc-400">
          Email:{" "}
          <span className="text-zinc-200">{email}</span>
        </p>
      )}

      {reason && (
        <div className="mt-3 border-l-2 border-red-500/60 bg-zinc-950/40 px-3 py-2">
          <span className="mc-mono block text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
            ▸ Lý do
          </span>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-100">{reason}</p>
        </div>
      )}

      {bannedAt && (
        <p className="mc-mono mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Thời điểm cấm:{" "}
          <span className="text-zinc-300">{formatDate(bannedAt)}</span>
        </p>
      )}

      <div className="mt-4 border-t border-red-500/30 pt-3">
        <p className="text-[12px] leading-relaxed text-zinc-300">
          Nếu bạn cho rằng đây là sự nhầm lẫn hoặc lý do không hợp lý, vui lòng
          liên hệ:
        </p>
        <a
          href="mailto:support@gatecat.net?subject=Khi%E1%BA%BFu%20n%E1%BA%A1i%20t%C3%A0i%20kho%E1%BA%A3n%20b%E1%BB%8B%20c%E1%BA%A5m"
          className="mc-mono mt-2 inline-flex items-center gap-2 border-2 border-orange-500 bg-orange-500/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300 transition hover:bg-orange-500 hover:text-zinc-950"
        >
          ✉ support@gatecat.net
        </a>
      </div>
    </div>
  );
}
