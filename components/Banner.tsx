import Link from "next/link";
import { listBanners, getSiteSettings } from "@/lib/site";
import { BannerCarousel } from "./BannerCarousel";

export async function Banner() {
  const [banners, settings] = await Promise.all([
    listBanners(true),
    getSiteSettings(),
  ]);
  const heroBgUrl = settings.heroBgUrl;

  return (
    <section className="relative flex h-[calc(100vh-113px)] flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Banner carousel — fixed height at top */}
      {banners.length > 0 && (
        <div className="h-36 shrink-0 lg:h-40">
          <BannerCarousel
            className="h-full"
            aspectClass="h-full"
            items={banners.map((b) => ({
              id: b.id,
              imageUrl: b.imageUrl,
              linkUrl: b.linkUrl,
              title: b.title,
            }))}
          />
        </div>
      )}

      {/* Hero area — fills remaining height */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Background image layer */}
        {heroBgUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroBgUrl}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-950/90"
            />
          </>
        )}

        {/* Decorative glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 top-10 h-[400px] w-[400px] rounded-full bg-orange-500/15 blur-[160px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-orange-500/5 blur-[140px]"
        />

        {/* Hero grid — expands to fill */}
        <div className="relative mx-auto flex w-full flex-1 flex-col px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <div className="grid flex-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left: Hero text */}
            <div className="rise-in flex flex-col justify-center lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-[12px] font-semibold text-orange-400 ring-1 ring-orange-500/20 self-start">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" aria-hidden />
                Ưu đãi đặc biệt
              </div>

              <h1 className="mt-4 text-[28px] font-bold leading-[1.1] tracking-tight sm:text-[38px] lg:text-[48px]">
                Mua sắm thông minh,{" "}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  giá tốt nhất
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-zinc-400">
                Tuyển chọn sản phẩm chính hãng với mức giá tốt nhất. Giao hàng nhanh,
                bảo hành uy tín, hỗ trợ tận tâm.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-[14px] font-bold text-zinc-950 shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 hover:shadow-orange-500/30"
                >
                  Khám phá ngay
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Showcase card */}
            <div className="rise-in-200 lg:col-span-5">
              {(settings.heroShowcaseLabel || settings.heroShowcaseText || settings.heroShowcaseImageUrl) ? (
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl ring-1 ring-zinc-800 sm:aspect-[6/5]">
                  {settings.heroShowcaseImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.heroShowcaseImageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"
                      />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500 opacity-20 blur-3xl"
                      />
                    </>
                  )}
                  <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                    {settings.heroShowcaseLabel && (
                      <p className="text-[12px] font-semibold uppercase tracking-widest text-orange-400">
                        {settings.heroShowcaseLabel}
                      </p>
                    )}
                    {settings.heroShowcaseText && (
                      <p className="mt-2 text-[22px] font-bold leading-tight tracking-tight sm:text-[28px]">
                        {settings.heroShowcaseText}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl ring-1 ring-zinc-800 sm:aspect-[6/5]">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                  <span aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500 opacity-20 blur-3xl" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust badges — pinned to bottom */}
        <div className="relative mx-auto w-full shrink-0 px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 py-4 sm:grid-cols-3">
            {[
              { icon: "✓", title: "Chính hãng 100%", desc: "Bảo hành theo nhà sản xuất" },
              { icon: "⚡", title: "Giao hàng nhanh", desc: "Nội thành — miễn phí từ 500K" },
              { icon: "🔄", title: "Trả góp 0%", desc: "Qua thẻ tín dụng & đối tác" },
            ].map((s) => (
              <div
                key={s.title}
                className="flex items-start gap-3 rounded-xl bg-zinc-900/60 p-4 ring-1 ring-zinc-800 backdrop-blur-sm"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-[14px]">
                  {s.icon}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-zinc-100">
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
