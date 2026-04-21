import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotFoundRedirect } from "@/components/NotFoundRedirect";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-strong)] bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="text-[44px] font-bold leading-none text-[var(--color-accent)]">
            404
          </p>
          <h1 className="mt-3 text-[18px] font-semibold text-[var(--color-text)]">
            Không tìm thấy trang
          </h1>
          <p className="mt-2 text-[13px] text-[var(--color-text-dim)]">
            Trang bạn đang tìm không tồn tại hoặc đã bị xoá.
          </p>
          <NotFoundRedirect seconds={10} />
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--color-text)] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-black"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
