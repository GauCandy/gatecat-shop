import Link from "next/link";
import { listBanners } from "@/lib/site";
import { BannerCarousel } from "./BannerCarousel";

export async function Banner() {
  const banners = await listBanners(true);

  return (
    <section className="relative overflow-hidden border-b-2 border-orange-500/40 bg-zinc-950 text-zinc-100">
      <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-30" />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-[480px] w-[480px] rounded-full bg-orange-500/20 blur-[160px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-yellow-500/10 blur-[140px]"
      />

      <div className="relative mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
        {/* HUD strip */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-y-2 border-zinc-800 py-3">
          <div className="mc-mono flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            <span><span className="text-orange-500">⬢</span> MFG_LOG · 2026.05.07</span>
            <span className="hidden sm:inline">PLANT 01 · SAIGON</span>
            <span className="hidden md:inline">SHIFT · A · 24/7</span>
          </div>
          <div className="mc-mono flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 [animation:mc-pulse_1.4s_ease-in-out_infinite]" />
            STATUS · ALL SYS GO
          </div>
        </div>

        <div className="grid gap-10 py-4 lg:grid-cols-12 lg:gap-12 lg:py-12">
          <div className="rise-in flex flex-col justify-between lg:col-span-7">
            <div>
              <div className="mc-mono inline-flex items-center gap-3 border-l-4 border-orange-500 bg-zinc-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.32em] text-orange-400">
                ⬢ EDITION 06 · 2026 · COMMISSIONED
              </div>

              <h1 className="mt-6 text-[44px] font-black uppercase leading-[0.92] tracking-[-0.04em] sm:text-[64px] lg:text-[84px]">
                <span className="block">HEAVY DUTY.</span>
                <span className="block mc-stroke-orange">MAX OUTPUT.</span>
              </h1>

              <p className="mt-7 max-w-md text-[14px] leading-relaxed text-zinc-400">
                Tuyển chọn laptop, PC, linh kiện và phụ kiện chính hãng — rivet,
                lắp ráp, stress-test 72h trước khi rời nhà máy.
              </p>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/products" className="mc-btn-primary mc-btn-primary-lg">
                ⬢ DEPLOY UNIT
              </Link>
              <Link href="/products" className="mc-btn-outline mc-btn-outline-lg">
                / SPEC SHEET
              </Link>
            </div>
          </div>

          <div className="rise-in-200 lg:col-span-5">
            {banners.length > 0 ? (
              <div className="relative">
                <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-br mc-rivet-lg" />
                <div className="border-2 border-zinc-700 bg-zinc-900 p-2">
                  <BannerCarousel
                    items={banners.map((b) => ({
                      id: b.id,
                      imageUrl: b.imageUrl,
                      linkUrl: b.linkUrl,
                      title: b.title,
                    }))}
                  />
                </div>
              </div>
            ) : (
              <div className="relative aspect-[5/4] sm:aspect-[6/5]">
                <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-br mc-rivet-lg" />
                <div className="absolute inset-2 overflow-hidden border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-950">
                  <div aria-hidden className="mc-hex absolute inset-0 opacity-30 mix-blend-overlay" />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500 opacity-30 blur-3xl"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-yellow-500/15 blur-3xl"
                  />
                  <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                    <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.32em] text-orange-500">
                      ⬢ NOW SHOWING
                    </p>
                    <p className="mt-3 text-[26px] font-black uppercase leading-tight tracking-tight sm:text-[34px]">
                      Bộ sưu tập đang được lắp ráp.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stat plates */}
        <div className="mt-2 grid grid-cols-2 gap-3 border-t-2 border-zinc-800 py-6 sm:grid-cols-3">
          {[
            { k: "01", v: "Chính hãng", d: "Nhập khẩu, bảo hành theo nhà sản xuất" },
            { k: "02", v: "Hỏa tốc 2H", d: "Nội thành — miễn phí từ 500K" },
            { k: "03", v: "Trả góp 0%", d: "Qua thẻ tín dụng & đối tác tài chính" },
          ].map((s) => (
            <div
              key={s.k}
              className="relative border-2 border-zinc-800 bg-zinc-900 p-4"
            >
              <span className="mc-rivet mc-rivet-tl" />
              <span className="mc-rivet mc-rivet-tr" />
              <span className="mc-mono text-[9px] font-bold uppercase tracking-[0.3em] text-orange-500">
                ⬢ {s.k}
              </span>
              <p className="mt-2 text-[14px] font-black uppercase tracking-[0.04em] text-zinc-100">
                {s.v}
              </p>
              <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[11px]">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
