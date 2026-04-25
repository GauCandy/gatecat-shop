import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  state: "Phiên đăng nhập không hợp lệ, vui lòng thử lại.",
  oauth: "Không thể xác thực với Google. Vui lòng thử lại.",
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const message = error ? ERROR_MESSAGES[error] : null;

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-text)] text-[12px] font-semibold text-white">
            G
          </span>
          <span className="text-[16px] font-semibold tracking-tight">
            Gatecat
          </span>
        </Link>

        <h1 className="mt-6 text-[26px] font-semibold tracking-tight">
          Đăng nhập
        </h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-dim)]">
          Tiếp tục để mua sắm và theo dõi đơn hàng của bạn
        </p>

        {message && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {message}
          </div>
        )}

        <a
          href="/api/auth/google/start"
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-[14px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
        >
          <GoogleIcon />
          Đăng nhập với Google
        </a>

        <p className="mt-8 text-center text-[12px] text-[var(--color-text-dim)]">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <Link href="/terms" className="underline hover:text-[var(--color-text)]">
            điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link href="/privacy" className="underline hover:text-[var(--color-text)]">
            chính sách bảo mật
          </Link>
          .
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
