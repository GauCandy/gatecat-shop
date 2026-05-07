import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotFoundRedirect } from "@/components/NotFoundRedirect";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="relative flex flex-1 items-center justify-center px-4 py-16">
        <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-20" />
        <span aria-hidden className="pointer-events-none absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-orange-500/15 blur-[140px]" />

        <div className="relative w-full max-w-md">
          <div className="relative border-2 border-orange-500/60 bg-zinc-900 p-8 text-center shadow-[8px_8px_0_#09090b]">
            <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

            <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
              ⬢ ERR · 404
            </p>
            <p className="mc-mono mt-3 text-[80px] font-black leading-none mc-stroke-orange">
              404
            </p>
            <h1 className="mt-5 text-[20px] font-black uppercase leading-tight tracking-tight text-zinc-100">
              UNIT NOT FOUND<span className="text-orange-500">.</span>
            </h1>
            <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              ▸ Trang bạn đang tìm không tồn tại hoặc đã bị xoá.
            </p>
            <NotFoundRedirect seconds={10} />
            <Link href="/" className="mc-btn-primary mc-btn-primary-lg mt-5">
              ⬢ VỀ TRANG CHỦ →
            </Link>
          </div>

          <p className="mc-mono mt-4 text-center text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-600">
            ⬢ SYS_ERR · GC·404·26
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
